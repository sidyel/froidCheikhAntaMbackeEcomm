import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { Produit } from '../../../models/interfaces';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { ApiService } from '../../../services/api.service';
import { ToastService } from '../../../services/toast.service';

@Component({
  selector: 'app-product-card',
  template: `
    <div class="card group cursor-pointer overflow-hidden"
         (click)="navigateToProduct()"
         [class.opacity-60]="!produit.disponibilite">

      <!-- Product Image -->
      <div class="relative overflow-hidden">
        <div class="aspect-w-1 aspect-h-1 w-full">
          <img
            [src]="getMainImageUrl()"
            [alt]="produit.nomProduit"
            class="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-105"
            onerror="this.src='assets/images/placeholder-product.jpg'"
          >
        </div>

        <!-- Overlay Actions -->
        <div class="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 transition-all duration-300 flex items-center justify-center opacity-0 group-hover:opacity-100">
          <div class="flex space-x-2">
            <!-- Quick View -->
            <button
              (click)="onQuickView($event)"
              class="p-2 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors"
              title="Aperçu rapide">
              <lucide-icon name="eye" class="w-5 h-5 text-gray-700"></lucide-icon>
            </button>

            <!-- Add to Wishlist -->
            <button
              *ngIf="isAuthenticated"
              (click)="toggleWishlist($event)"
              [class]="isInWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-700'"
              class="p-2 rounded-full shadow-lg hover:scale-105 transition-all"
              [title]="isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'">
              <lucide-icon name="heart" class="w-5 h-5" [class.fill-current]="isInWishlist"></lucide-icon>
            </button>
          </div>
        </div>

        <!-- Stock Status Badge -->
        <div class="absolute top-3 left-3">
          <span *ngIf="!produit.disponibilite"
                class="badge bg-red-500 text-white px-2 py-1 text-xs font-semibold">
            Indisponible
          </span>
          <span *ngIf="produit.disponibilite && produit.stockDisponible <= 5"
                class="badge bg-orange-500 text-white px-2 py-1 text-xs font-semibold">
            Stock limité
          </span>
        </div>

        <!-- Discount Badge (if needed) -->
        <div class="absolute top-3 right-3" *ngIf="hasDiscount()">
          <span class="badge bg-red-500 text-white px-2 py-1 text-xs font-semibold">
            -{{ getDiscountPercentage() }}%
          </span>
        </div>
      </div>

      <!-- Product Info -->
      <div class="card-body">
        <!-- Brand -->
        <div class="flex items-center justify-between mb-2">
          <span *ngIf="produit.marque" class="text-sm text-gray-500 font-medium">
            {{ produit.marque.nomMarque }}
          </span>
          <span *ngIf="produit.refProduit" class="text-xs text-gray-400">
            {{ produit.refProduit }}
          </span>
        </div>

        <!-- Product Name -->
        <h3 class="text-lg font-semibold text-gray-900 mb-2 line-clamp-2 group-hover:text-primary-600 transition-colors">
          {{ produit.nomProduit }}
        </h3>

        <!-- Product Description -->
        <p *ngIf="produit.descriptionProduit"
           class="text-sm text-gray-600 mb-3 line-clamp-2">
          {{ produit.descriptionProduit }}
        </p>

        <!-- Technical Info -->
        <div class="flex flex-wrap gap-2 mb-3" *ngIf="hasTechnicalInfo()">
          <span *ngIf="produit.puissanceBTU"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800">
            {{ produit.puissanceBTU }} BTU
          </span>
          <span *ngIf="produit.labelEnergie"
                class="inline-flex items-center px-2 py-1 rounded-full text-xs bg-green-100 text-green-800">
            Classe {{ produit.labelEnergie.replace('_PLUS', '+') }}
          </span>
        </div>

        <!-- Price -->
        <div class="flex items-center justify-between mb-4">
          <div class="flex items-center space-x-2">
            <span class="text-2xl font-bold text-primary-600">
              {{ produit.prix | currency:'XOF':'symbol':'1.0-0' }}
            </span>
            <span *ngIf="hasDiscount()" class="text-lg text-gray-500 line-through">
              {{ getOriginalPrice() | currency:'XOF':'symbol':'1.0-0' }}
            </span>
          </div>
        </div>

        <!-- Actions -->
        <div class="flex space-x-2">
          <button
            (click)="addToCart($event)"
            [disabled]="!produit.disponibilite || produit.stockDisponible === 0 || isAddingToCart"
            class="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            [class.opacity-50]="!produit.disponibilite">
            <lucide-icon name="shopping-cart" class="w-4 h-4" *ngIf="!isAddingToCart"></lucide-icon>
            <div class="spinner" *ngIf="isAddingToCart"></div>
            <span>{{ getAddToCartText() }}</span>
          </button>

          <button
            (click)="navigateToProduct($event)"
            class="px-4 py-2 border border-primary-600 text-primary-600 rounded-lg hover:bg-primary-50 transition-colors">
            <lucide-icon name="eye" class="w-4 h-4"></lucide-icon>
          </button>
        </div>

        <!-- Stock Info -->
        <div class="mt-2 text-sm text-gray-500" *ngIf="produit.disponibilite">
          <span *ngIf="produit.stockDisponible > 10">
            En stock ({{ produit.stockDisponible }}+ disponibles)
          </span>
          <span *ngIf="produit.stockDisponible <= 10 && produit.stockDisponible > 0"
                class="text-orange-600">
            Plus que {{ produit.stockDisponible }} en stock
          </span>
          <span *ngIf="produit.stockDisponible === 0" class="text-red-600">
            Rupture de stock
          </span>
        </div>
      </div>
    </div>
  `
})
export class ProductCardComponent {
  @Input() produit!: Produit;
  @Input() showQuickActions = true;
  @Input() showTechnicalInfo = true;
  @Output() quickView = new EventEmitter<Produit>();
  @Output() wishlistToggle = new EventEmitter<{produit: Produit, isAdding: boolean}>();

  isAddingToCart = false;
  isInWishlist = false;
  isAuthenticated = false;

  constructor(
    private router: Router,
    private cartService: CartService,
    private authService: AuthService,
    private apiService: ApiService,
    private toastService: ToastService
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();

    // Vérifier si le produit est dans la wishlist
    if (this.isAuthenticated) {
      this.checkWishlistStatus();
    }
  }

  private checkWishlistStatus(): void {
    this.apiService.getWishlist().subscribe({
      next: (wishlist) => {
        this.isInWishlist = wishlist.includes(this.produit.idProduit);
      },
      error: (error) => {
        console.error('Erreur lors de la vérification de la wishlist:', error);
      }
    });
  }

  getMainImageUrl(): string {
    if (this.produit.listeImages && this.produit.listeImages.length > 0) {
      return `http://localhost:8080/uploads/${this.produit.listeImages[0]}`;
    }
    return 'assets/images/placeholder-product.jpg';
  }

  navigateToProduct(event?: Event): void {
    if (event) {
      event.stopPropagation();
    }
    this.router.navigate(['/produit', this.produit.idProduit]);
  }

  addToCart(event: Event): void {
    event.stopPropagation();

    if (!this.produit.disponibilite || this.produit.stockDisponible === 0) {
      this.toastService.error('Produit indisponible', 'Ce produit n\'est pas disponible actuellement');
      return;
    }

    this.isAddingToCart = true;

    // Simuler un délai pour l'UX
    setTimeout(() => {
      this.cartService.addToCart(this.produit, 1);
      this.isAddingToCart = false;
    }, 300);
  }

  onQuickView(event: Event): void {
    event.stopPropagation();
    this.quickView.emit(this.produit);
  }

  toggleWishlist(event: Event): void {
    event.stopPropagation();

    if (!this.isAuthenticated) {
      this.toastService.warning('Connexion requise', 'Veuillez vous connecter pour ajouter des produits à votre liste de souhaits');
      this.router.navigate(['/connexion']);
      return;
    }

    const isAdding = !this.isInWishlist;

    if (isAdding) {
      this.apiService.ajouterAWishlist(this.produit.idProduit).subscribe({
        next: () => {
          this.isInWishlist = true;
          this.toastService.wishlistAdded(this.produit.nomProduit);
          this.wishlistToggle.emit({ produit: this.produit, isAdding: true });
        },
        error: (error) => {
          console.error('Erreur lors de l\'ajout à la wishlist:', error);
          this.toastService.error('Erreur', 'Impossible d\'ajouter le produit à la wishlist');
        }
      });
    } else {
      this.apiService.retirerDeWishlist(this.produit.idProduit).subscribe({
        next: () => {
          this.isInWishlist = false;
          this.toastService.wishlistRemoved(this.produit.nomProduit);
          this.wishlistToggle.emit({ produit: this.produit, isAdding: false });
        },
        error: (error) => {
          console.error('Erreur lors de la suppression de la wishlist:', error);
          this.toastService.error('Erreur', 'Impossible de retirer le produit de la wishlist');
        }
      });
    }
  }

  getAddToCartText(): string {
    if (!this.produit.disponibilite) {
      return 'Indisponible';
    }
    if (this.produit.stockDisponible === 0) {
      return 'Rupture de stock';
    }
    if (this.isAddingToCart) {
      return 'Ajout...';
    }
    return 'Ajouter au panier';
  }

  hasTechnicalInfo(): boolean {
    return !!(this.produit.puissanceBTU || this.produit.labelEnergie || this.produit.consommationWatt);
  }

  hasDiscount(): boolean {
    // Logique pour détecter une remise (à adapter selon vos besoins)
    // Pour l'instant, on retourne false car pas de champ discount dans le modèle
    return false;
  }

  getDiscountPercentage(): number {
    // Logique pour calculer le pourcentage de remise
    return 0;
  }

  getOriginalPrice(): number {
    // Logique pour récupérer le prix original avant remise
    return this.produit.prix;
  }

  // Méthodes utiles pour le parent
  isProductInCart(): boolean {
    return this.cartService.isInCart(this.produit.idProduit);
  }

  getCartQuantity(): number {
    const cartItem = this.cartService.getCartItem(this.produit.idProduit);
    return cartItem ? cartItem.quantite : 0;
  }

  canAddToCart(): boolean {
    return this.produit.disponibilite && this.produit.stockDisponible > 0;
  }
}
