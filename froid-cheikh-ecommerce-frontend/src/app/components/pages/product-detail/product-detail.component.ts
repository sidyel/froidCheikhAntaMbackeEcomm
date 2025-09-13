import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil, catchError } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { CartService } from '../../../services/cart.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Produit, Breadcrumb } from '../../../models/interfaces';

@Component({
  selector: 'app-product-detail',
  template: `
    <div class="min-h-screen bg-gray-50" *ngIf="!isLoading && produit">

      <!-- Breadcrumb -->
      <app-breadcrumb [breadcrumbs]="breadcrumbs"></app-breadcrumb>

      <div class="container mx-auto px-4 py-8">

        <!-- Product Detail -->
        <div class="bg-white rounded-xl shadow-lg overflow-hidden">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">

            <!-- Product Images -->
            <div class="p-6">
              <!-- Main Image -->
              <div class="aspect-w-1 aspect-h-1 mb-4">
                <img
                  [src]="getMainImageUrl()"
                  [alt]="produit.nomProduit"
                  class="w-full h-96 object-cover rounded-lg cursor-pointer"
                  (click)="openImageGallery()"
                  onerror="this.src='assets/images/placeholder-product.jpg'">
              </div>

              <!-- Image Thumbnails -->
              <div class="flex space-x-2 overflow-x-auto" *ngIf="produit.listeImages && produit.listeImages.length > 1">
                <button
                  *ngFor="let image of produit.listeImages; let i = index"
                  (click)="selectImage(i)"
                  [class.ring-2]="selectedImageIndex === i"
                  [class.ring-primary-500]="selectedImageIndex === i"
                  class="flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 border-gray-200 hover:border-primary-300 transition-colors">
                  <img
                    [src]="getImageUrl(image)"
                    [alt]="produit.nomProduit"
                    class="w-full h-full object-cover"
                    onerror="this.src='assets/images/placeholder-product.jpg'">
                </button>
              </div>

              <!-- Video Thumbnails -->
              <div class="mt-4 space-y-2" *ngIf="produit.videosOptionnelles && produit.videosOptionnelles.length > 0">
                <h4 class="text-sm font-medium text-gray-900">Vidéos du produit</h4>
                <div class="flex space-x-2">
                  <button
                    *ngFor="let video of produit.videosOptionnelles"
                    (click)="playVideo(video)"
                    class="flex-shrink-0 w-20 h-20 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-gray-200 hover:border-primary-300 transition-colors">
                    <lucide-icon name="play" class="w-8 h-8 text-gray-600"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>

            <!-- Product Information -->
            <div class="p-6">

              <!-- Brand and Reference -->
              <div class="flex items-center justify-between mb-4">
                <div class="flex items-center space-x-3">
                  <span *ngIf="produit.marque" class="text-sm font-medium text-primary-600">
                    {{ produit.marque.nomMarque }}
                  </span>
                  <span *ngIf="produit.refProduit" class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    Réf: {{ produit.refProduit }}
                  </span>
                </div>

                <!-- Wishlist Button -->
                <button
                  *ngIf="isAuthenticated"
                  (click)="toggleWishlist()"
                  [class]="isInWishlist ? 'text-red-500' : 'text-gray-400'"
                  class="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  [title]="isInWishlist ? 'Retirer des favoris' : 'Ajouter aux favoris'">
                  <lucide-icon name="heart" class="w-6 h-6" [class.fill-current]="isInWishlist"></lucide-icon>
                </button>
              </div>

              <!-- Product Name -->
              <h1 class="text-3xl font-bold text-gray-900 mb-4">
                {{ produit.nomProduit }}
              </h1>

              <!-- Price -->
              <div class="mb-6">
                <div class="flex items-center space-x-3">
                  <span class="text-4xl font-bold text-primary-600">
                    {{ produit.prix | currency:'XOF':'symbol':'1.0-0' }}
                  </span>
                </div>
                <p class="text-sm text-gray-600 mt-1">Prix TTC</p>
              </div>

              <!-- Technical Specifications -->
              <div class="mb-6" *ngIf="hasTechnicalSpecs()">
                <h3 class="text-lg font-semibold text-gray-900 mb-3">Caractéristiques techniques</h3>
                <div class="grid grid-cols-2 gap-4">
                  <div *ngIf="produit.puissanceBTU" class="flex items-center space-x-2">
                    <lucide-icon name="zap" class="w-4 h-4 text-blue-500"></lucide-icon>
                    <span class="text-sm">{{ produit.puissanceBTU }} BTU</span>
                  </div>
                  <div *ngIf="produit.labelEnergie" class="flex items-center space-x-2">
                    <lucide-icon name="shield" class="w-4 h-4 text-green-500"></lucide-icon>
                    <span class="text-sm">Classe {{ produit.labelEnergie.replace('_PLUS', '+') }}</span>
                  </div>
                  <div *ngIf="produit.consommationWatt" class="flex items-center space-x-2">
                    <lucide-icon name="zap" class="w-4 h-4 text-yellow-500"></lucide-icon>
                    <span class="text-sm">{{ produit.consommationWatt }}W</span>
                  </div>
                  <div *ngIf="produit.dimensions" class="flex items-center space-x-2">
                    <lucide-icon name="package" class="w-4 h-4 text-gray-500"></lucide-icon>
                    <span class="text-sm">{{ produit.dimensions }}</span>
                  </div>
                  <div *ngIf="produit.poids" class="flex items-center space-x-2">
                    <lucide-icon name="package" class="w-4 h-4 text-gray-500"></lucide-icon>
                    <span class="text-sm">{{ produit.poids }} kg</span>
                  </div>
                  <div *ngIf="produit.garantie" class="flex items-center space-x-2">
                    <lucide-icon name="shield" class="w-4 h-4 text-purple-500"></lucide-icon>
                    <span class="text-sm">{{ produit.garantie }}</span>
                  </div>
                </div>
              </div>

              <!-- Stock Status -->
              <div class="mb-6">
                <div class="flex items-center space-x-2 mb-2">
                  <div [class]="getStockIndicatorClass()"></div>
                  <span [class]="getStockTextClass()">{{ getStockText() }}</span>
                </div>
                <p class="text-xs text-gray-500" *ngIf="produit.disponibilite && produit.stockDisponible > 0">
                  {{ produit.stockDisponible }} unité{{ produit.stockDisponible > 1 ? 's' : '' }} disponible{{ produit.stockDisponible > 1 ? 's' : '' }}
                </p>
              </div>

              <!-- Quantity Selector and Add to Cart -->
              <div class="mb-6" *ngIf="produit.disponibilite && produit.stockDisponible > 0">
                <div class="flex items-center space-x-4 mb-4">
                  <label class="text-sm font-medium text-gray-700">Quantité:</label>
                  <div class="flex items-center space-x-2">
                    <button
                      (click)="decreaseQuantity()"
                      [disabled]="selectedQuantity <= 1"
                      class="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50">
                      <lucide-icon name="minus" class="w-4 h-4"></lucide-icon>
                    </button>
                    <span class="px-4 py-2 border rounded-md min-w-[60px] text-center">{{ selectedQuantity }}</span>
                    <button
                      (click)="increaseQuantity()"
                      [disabled]="selectedQuantity >= produit.stockDisponible"
                      class="p-2 border rounded-md hover:bg-gray-50 disabled:opacity-50">
                      <lucide-icon name="plus" class="w-4 h-4"></lucide-icon>
                    </button>
                  </div>
                </div>

                <div class="flex space-x-3">
                  <button
                    (click)="addToCart()"
                    [disabled]="isAddingToCart"
                    class="flex-1 btn-primary py-3 text-lg flex items-center justify-center space-x-2">
                    <lucide-icon name="shopping-cart" class="w-5 h-5" *ngIf="!isAddingToCart"></lucide-icon>
                    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" *ngIf="isAddingToCart"></div>
                    <span>{{ isAddingToCart ? 'Ajout...' : 'Ajouter au panier' }}</span>
                  </button>

                  <button
                    (click)="buyNow()"
                    class="px-8 btn-secondary py-3 text-lg flex items-center space-x-2">
                    <lucide-icon name="credit-card" class="w-5 h-5"></lucide-icon>
                    <span>Acheter</span>
                  </button>
                </div>
              </div>

              <!-- Product unavailable -->
              <div class="mb-6" *ngIf="!produit.disponibilite || produit.stockDisponible === 0">
                <div class="bg-red-50 border border-red-200 rounded-lg p-4">
                  <div class="flex items-center space-x-2">
                    <lucide-icon name="alert-circle" class="w-5 h-5 text-red-500"></lucide-icon>
                    <span class="text-red-800 font-medium">Produit indisponible</span>
                  </div>
                  <p class="text-red-700 text-sm mt-1">
                    Ce produit n'est actuellement pas disponible. Contactez-nous pour plus d'informations.
                  </p>
                </div>
              </div>

              <!-- Actions -->
              <div class="border-t pt-6 space-y-4">
                <!-- Contact -->
                <div class="flex items-center space-x-4">
                  <a
                    href="tel:+221773352000"
                    class="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors">
                    <lucide-icon name="phone" class="w-4 h-4"></lucide-icon>
                    <span class="text-sm">Appelez-nous pour plus d'infos</span>
                  </a>
                </div>

                <!-- Technical Sheet -->
                <div *ngIf="produit.ficheTechniquePDF">
                  <a
                    [href]="getTechnicalSheetUrl()"
                    target="_blank"
                    class="flex items-center space-x-2 text-blue-600 hover:text-blue-700 transition-colors">
                    <lucide-icon name="download" class="w-4 h-4"></lucide-icon>
                    <span class="text-sm">Télécharger la fiche technique</span>
                  </a>
                </div>

                <!-- Share -->
                <div class="flex items-center space-x-2">
                  <span class="text-sm text-gray-600">Partager:</span>
                  <button
                    (click)="shareProduct('whatsapp')"
                    class="p-1 text-green-600 hover:text-green-700 transition-colors">
                    <span class="text-xs">WhatsApp</span>
                  </button>
                  <button
                    (click)="shareProduct('copy')"
                    class="p-1 text-gray-600 hover:text-gray-700 transition-colors">
                    <lucide-icon name="copy" class="w-4 h-4"></lucide-icon>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Description Section -->
        <div class="mt-8 bg-white rounded-xl shadow-lg p-6" *ngIf="produit.descriptionProduit">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Description du produit</h3>
          <div class="prose max-w-none">
            <p class="text-gray-700 leading-relaxed">
              {{ produit.descriptionProduit }}
            </p>
          </div>
        </div>

        <!-- Specifications -->
        <div class="mt-8 bg-white rounded-xl shadow-lg p-6" *ngIf="getSpecifications().length > 0">
          <h3 class="text-lg font-semibold text-gray-900 mb-4">Spécifications techniques</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div *ngFor="let spec of getSpecifications()" class="flex justify-between py-2 border-b border-gray-100">
              <span class="text-gray-600">{{ spec.label }}</span>
              <span class="font-medium text-gray-900">{{ spec.value }}</span>
            </div>
          </div>
        </div>

        <!-- Related Products -->
        <div class="mt-12" *ngIf="relatedProducts.length > 0">
          <h2 class="text-2xl font-bold text-gray-900 mb-6">Produits similaires</h2>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <app-product-card
              *ngFor="let relatedProduct of relatedProducts.slice(0, 4)"
              [produit]="relatedProduct">
            </app-product-card>
          </div>
        </div>
      </div>
    </div>

    <!-- Loading State -->
    <div *ngIf="isLoading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <div class="w-16 h-16 border-4 border-primary-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p class="text-gray-600">Chargement du produit...</p>
        <p class="text-sm text-gray-500 mt-2">ID: {{ currentProductId }}</p>
      </div>
    </div>

    <!-- Product Not Found -->
    <div *ngIf="!isLoading && !produit && hasError" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <lucide-icon name="package" class="w-24 h-24 text-gray-300 mx-auto mb-4"></lucide-icon>
        <h2 class="text-2xl font-semibold text-gray-900 mb-2">Produit non trouvé</h2>
        <p class="text-gray-600 mb-6">Le produit que vous recherchez n'existe pas ou n'est plus disponible.</p>
        <button (click)="goBack()" class="btn-primary flex items-center space-x-2">
          <lucide-icon name="arrow-left" class="w-4 h-4"></lucide-icon>
          <span>Retour</span>
        </button>
      </div>
    </div>
  `
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  produit: Produit | null = null;
  relatedProducts: Produit[] = [];
  breadcrumbs: Breadcrumb[] = [];

  isLoading = true;
  hasError = false;
  isAddingToCart = false;
  isInWishlist = false;
  isAuthenticated = false;

  selectedImageIndex = 0;
  selectedQuantity = 1;
  currentProductId: number = 0;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private apiService: ApiService,
    private cartService: CartService,
    private authService: AuthService,
    private toastService: ToastService
  ) {
    this.isAuthenticated = this.authService.isAuthenticated();
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this.destroy$))
      .subscribe(params => {
        const productId = +params['id'];
        this.currentProductId = productId;

        if (productId && !isNaN(productId)) {
          console.log('Loading product with ID:', productId);
          this.loadProduct(productId);
        } else {
          console.error('Invalid product ID:', params['id']);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadProduct(productId: number): void {
    console.log('🔄 Starting product load for ID:', productId);
    this.isLoading = true;
    this.hasError = false;
    this.produit = null;

    // Charger SEULEMENT le produit, sans dépendances qui peuvent échouer
    this.apiService.getProduitById(productId)
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.error('❌ Erreur lors du chargement du produit:', error);
          this.hasError = true;
          this.isLoading = false;
          throw error;
        })
      )
      .subscribe({
        next: (product) => {
          console.log('✅ Produit chargé avec succès:', product);
          this.produit = product;
          this.updateBreadcrumbs();
          this.isLoading = false;

          // Charger les données supplémentaires en arrière-plan
          this.loadAdditionalData(productId);
        },
        error: (error) => {
          console.error('❌ Erreur dans subscribe:', error);
          this.hasError = true;
          this.isLoading = false;
        }
      });
  }

  private loadAdditionalData(productId: number): void {
    // Charger la wishlist séparément (ne pas bloquer l'affichage si ça échoue)
    if (this.isAuthenticated) {
      this.checkWishlistStatus(productId);
    }

    // Charger les produits similaires séparément
    this.loadRelatedProducts();
  }

  private checkWishlistStatus(productId: number): void {
    // TODO: Implémenter quand l'API wishlist sera prête
    // this.apiService.getWishlist()
    //   .pipe(takeUntil(this.destroy$))
    //   .subscribe({
    //     next: (wishlist) => {
    //       this.isInWishlist = wishlist.includes(productId);
    //     },
    //     error: (error) => {
    //       console.log('Wishlist non disponible:', error);
    //     }
    //   });
  }

  private loadRelatedProducts(): void {
    if (!this.produit?.categorie?.idCategorie) return;

    const categoryId = this.produit.categorie.idCategorie;

    this.apiService.getProduitsByCategorie(categoryId, { size: 8 })
      .pipe(
        takeUntil(this.destroy$),
        catchError(error => {
          console.log('Produits similaires non disponibles:', error);
          return [];
        })
      )
      .subscribe(response => {
        if (response && response.content) {
          this.relatedProducts = response.content.filter(p => p.idProduit !== this.produit?.idProduit);
        }
      });
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Accueil', route: '/' },
      { label: 'Produits', route: '/produits' }
    ];

    if (this.produit?.categorie) {
      this.breadcrumbs.push({
        label: this.produit.categorie.nomCategorie,
        route: `/produits/categorie/${this.produit.categorie.idCategorie}`
      });
    }

    if (this.produit) {
      this.breadcrumbs.push({
        label: this.produit.nomProduit,
        route: undefined
      });
    }
  }

  // Image methods
  getMainImageUrl(): string {
    if (this.produit?.listeImages && this.produit.listeImages.length > 0) {
      const imagePath = this.produit.listeImages[this.selectedImageIndex];
      console.log('🖼️  Main image path:', imagePath);

      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      // CORRECTION: URL directe
      const fullUrl = `http://localhost:8080/uploads/${imagePath}`;
      console.log('🔗 Main image URL:', fullUrl);
      return fullUrl;
    }
    return 'assets/images/placeholder-product.jpg';
  }

  getImageUrl(imagePath: string): string {
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    return `http://localhost:8080/uploads/${imagePath}`;
  }

  getTechnicalSheetUrl(): string {
    if (this.produit?.ficheTechniquePDF) {
      const filePath = this.produit.ficheTechniquePDF;
      if (filePath.startsWith('http')) {
        return filePath;
      }
      return `http://localhost:8080/uploads/${filePath}`;
    }
    return '';
  }

  selectImage(index: number): void {
    this.selectedImageIndex = index;
  }

  openImageGallery(): void {
    console.log('Open image gallery');
  }

  playVideo(videoPath: string): void {
    console.log('Play video:', videoPath);
  }

  // Quantity methods
  increaseQuantity(): void {
    if (this.produit && this.selectedQuantity < this.produit.stockDisponible) {
      this.selectedQuantity++;
    }
  }

  decreaseQuantity(): void {
    if (this.selectedQuantity > 1) {
      this.selectedQuantity--;
    }
  }

  // Product actions
  addToCart(): void {
    if (!this.produit) return;

    this.isAddingToCart = true;

    try {
      this.cartService.addToCart(this.produit, this.selectedQuantity);
      this.toastService.success('Produit ajouté', `${this.produit.nomProduit} a été ajouté au panier`);
    } catch (error) {
      this.toastService.error('Erreur', 'Impossible d\'ajouter le produit au panier');
    }

    setTimeout(() => {
      this.isAddingToCart = false;
    }, 500);
  }

  buyNow(): void {
    if (!this.produit) return;

    this.cartService.addToCart(this.produit, this.selectedQuantity);
    this.router.navigate(['/panier']);
  }

  toggleWishlist(): void {
    if (!this.produit || !this.isAuthenticated) return;

    // Placeholder - implement when wishlist API is ready
    this.isInWishlist = !this.isInWishlist;
    const message = this.isInWishlist ? 'ajouté aux favoris' : 'retiré des favoris';
    this.toastService.success('Favoris', `Produit ${message}`);
  }

  shareProduct(method: string): void {
    const url = window.location.href;

    switch (method) {
      case 'whatsapp':
        const message = `Découvrez ce produit: ${this.produit?.nomProduit} - ${url}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
        break;
      case 'copy':
        navigator.clipboard.writeText(url).then(() => {
          this.toastService.success('Lien copié', 'Le lien du produit a été copié dans le presse-papiers');
        });
        break;
    }
  }

  // UI helper methods
  hasTechnicalSpecs(): boolean {
    return !!(this.produit?.puissanceBTU ||
      this.produit?.labelEnergie ||
      this.produit?.consommationWatt ||
      this.produit?.dimensions ||
      this.produit?.poids ||
      this.produit?.garantie);
  }

  getStockIndicatorClass(): string {
    if (!this.produit?.disponibilite || this.produit.stockDisponible === 0) {
      return 'w-3 h-3 bg-red-500 rounded-full';
    } else if (this.produit.stockDisponible <= 5) {
      return 'w-3 h-3 bg-orange-500 rounded-full';
    } else {
      return 'w-3 h-3 bg-green-500 rounded-full';
    }
  }

  getStockTextClass(): string {
    if (!this.produit?.disponibilite || this.produit.stockDisponible === 0) {
      return 'text-red-600 font-medium';
    } else if (this.produit.stockDisponible <= 5) {
      return 'text-orange-600 font-medium';
    } else {
      return 'text-green-600 font-medium';
    }
  }

  getStockText(): string {
    if (!this.produit?.disponibilite) {
      return 'Produit indisponible';
    } else if (this.produit.stockDisponible === 0) {
      return 'Rupture de stock';
    } else if (this.produit.stockDisponible <= 5) {
      return 'Stock limité';
    } else {
      return 'En stock';
    }
  }

  getSpecifications(): {label: string, value: string}[] {
    const specs = [];

    if (this.produit?.puissanceBTU) {
      specs.push({ label: 'Puissance', value: `${this.produit.puissanceBTU} BTU` });
    }
    if (this.produit?.labelEnergie) {
      specs.push({ label: 'Classe énergétique', value: this.produit.labelEnergie.replace('_PLUS', '+') });
    }
    if (this.produit?.consommationWatt) {
      specs.push({ label: 'Consommation', value: `${this.produit.consommationWatt}W` });
    }
    if (this.produit?.dimensions) {
      specs.push({ label: 'Dimensions', value: this.produit.dimensions });
    }
    if (this.produit?.poids) {
      specs.push({ label: 'Poids', value: `${this.produit.poids} kg` });
    }
    if (this.produit?.garantie) {
      specs.push({ label: 'Garantie', value: this.produit.garantie });
    }
    if (this.produit?.refProduit) {
      specs.push({ label: 'Référence', value: this.produit.refProduit });
    }
    if (this.produit?.codeProduit) {
      specs.push({ label: 'Code produit', value: this.produit.codeProduit });
    }

    return specs;
  }

  goBack(): void {
    this.router.navigate(['/produits']);
  }
}
