import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { Subject, forkJoin } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { ApiService } from '../../../services/api.service';
import { Produit, Categorie, Marque } from '../../../models/interfaces';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-home',
  template: `
    <div class="min-h-screen">

      <!-- Hero Section -->
      <section class="relative bg-gradient-to-br from-primary-600 via-primary-700 to-primary-800 text-white overflow-hidden">
        <div class="absolute inset-0 bg-black opacity-20"></div>
        <div class="relative container mx-auto px-4 py-20 lg:py-32">
          <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">

            <!-- Hero Content -->
            <div class="space-y-6 animate-fade-in">
              <h1 class="text-4xl lg:text-6xl font-bold leading-tight">
                Froid Cheikh
                <br>
                <span class="text-secondary-400">Anta Mbacké</span>
              </h1>

              <p class="text-xl lg:text-2xl text-primary-100 leading-relaxed">
                Spécialiste en climatisation, réfrigération et électroménager depuis plus de 15 ans
              </p>

              <div class="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4">
                <button
                  (click)="navigateToProducts()"
                  class="btn-secondary text-lg px-8 py-4">
                  <lucide-icon name="package" class="w-5 h-5"></lucide-icon>
                  <span>Découvrir nos produits</span>
                </button>

                <button
                  (click)="navigateToContact()"
                  class="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4">
                  <lucide-icon name="phone" class="w-5 h-5"></lucide-icon>
                  <span>Nous contacter</span>
                </button>
              </div>

              <!-- Contact Info -->
              <div class="pt-8 border-t border-primary-500">
                <div class="flex flex-col sm:flex-row sm:items-center sm:space-x-8 space-y-2 sm:space-y-0">
                  <div class="flex items-center space-x-2">
                    <lucide-icon name="phone" class="w-5 h-5 text-secondary-400"></lucide-icon>
                    <span class="text-primary-100">77 335 20 00 / 76 888 04 42</span>
                  </div>
                  <div class="flex items-center space-x-2">
                    <lucide-icon name="map-pin" class="w-5 h-5 text-secondary-400"></lucide-icon>
                    <span class="text-primary-100">Ouest Foire, Cité Aelmas</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- Hero Image -->
            <div class="relative animate-slide-up">
              <div class="relative z-10">
                <img
                  src="assets/images/hero-climatiseur.jpg"
                  alt="Climatiseurs et électroménager Froid Cheikh"
                  class="w-full h-auto rounded-2xl shadow-2xl"
                  onerror="this.style.display='none'">
              </div>
              <!-- Decorative elements -->
              <div class="absolute -top-4 -right-4 w-32 h-32 bg-secondary-400 rounded-full opacity-20 animate-bounce-subtle"></div>
              <div class="absolute -bottom-4 -left-4 w-24 h-24 bg-accent-400 rounded-full opacity-20 animate-bounce-subtle" style="animation-delay: 1s;"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Categories Section -->
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos Catégories de Produits
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez notre large gamme de produits pour tous vos besoins en climatisation et électroménager
            </p>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6" *ngIf="categories.length > 0">
            <div
              *ngFor="let categorie of categories.slice(0, 8)"
              (click)="navigateToCategory(categorie)"
              class="group cursor-pointer">
              <div class="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border border-gray-100 hover:border-primary-200">
                <div class="aspect-w-1 aspect-h-1 bg-gradient-to-br from-primary-50 to-primary-100 p-8">
                  <div class="flex items-center justify-center">
                    <div class="w-16 h-16 bg-primary-600 rounded-full flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                      <lucide-icon [name]="getCategoryIcon(categorie)" class="w-8 h-8 text-white"></lucide-icon>
                    </div>
                  </div>
                </div>
                <div class="p-6 text-center">
                  <h3 class="text-lg font-semibold text-gray-900 group-hover:text-primary-600 transition-colors">
                    {{ categorie.nomCategorie }}
                  </h3>
                  <p class="text-sm text-gray-500 mt-2" *ngIf="categorie.nombreProduits">
                    {{ categorie.nombreProduits }} produit{{ categorie.nombreProduits > 1 ? 's' : '' }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Loading state -->
          <div *ngIf="isLoadingCategories" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="animate-pulse">
              <div class="bg-gray-200 rounded-xl h-48"></div>
            </div>
          </div>
        </div>
      </section>

      <!-- Featured Products Section -->
      <section class="py-16 bg-gray-50">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Produits Récents
            </h2>
            <p class="text-xl text-gray-600 max-w-3xl mx-auto">
              Découvrez nos dernières arrivées et les produits les plus populaires
            </p>
          </div>

          <div class="products-grid" *ngIf="featuredProducts.length > 0">
            <app-product-card
              *ngFor="let produit of featuredProducts"
              [produit]="produit"
              (quickView)="onQuickView($event)"
              (wishlistToggle)="onWishlistToggle($event)">
            </app-product-card>
          </div>

          <!-- Loading state -->
          <div *ngIf="isLoadingProducts" class="products-grid">
            <div *ngFor="let i of [1,2,3,4,5,6,7,8]" class="animate-pulse">
              <div class="bg-white rounded-xl shadow-lg">
                <div class="bg-gray-200 h-64 rounded-t-xl"></div>
                <div class="p-6 space-y-3">
                  <div class="bg-gray-200 h-4 rounded w-3/4"></div>
                  <div class="bg-gray-200 h-6 rounded w-1/2"></div>
                  <div class="bg-gray-200 h-10 rounded"></div>
                </div>
              </div>
            </div>
          </div>

          <div class="text-center mt-12">
            <button
              (click)="navigateToProducts()"
              class="btn-primary text-lg px-8 py-4">
              <lucide-icon name="arrow-right" class="w-5 h-5"></lucide-icon>
              <span>Voir tous les produits</span>
            </button>
          </div>
        </div>
      </section>

      <!-- Features Section -->
      <section class="py-16 bg-white">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Pourquoi Choisir Froid Cheikh ?
            </h2>
          </div>

          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div class="text-center group">
              <div class="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-primary-200 transition-colors">
                <lucide-icon name="truck" class="w-8 h-8 text-primary-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Livraison Rapide</h3>
              <p class="text-gray-600">Livraison gratuite à Dakar et ses environs</p>
            </div>

            <div class="text-center group">
              <div class="w-16 h-16 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-secondary-200 transition-colors">
                <lucide-icon name="settings" class="w-8 h-8 text-secondary-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Installation & SAV</h3>
              <p class="text-gray-600">Service d'installation et maintenance professionnels</p>
            </div>

            <div class="text-center group">
              <div class="w-16 h-16 bg-accent-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-accent-200 transition-colors">
                <lucide-icon name="shield" class="w-8 h-8 text-accent-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">Garantie Étendue</h3>
              <p class="text-gray-600">Garantie sur tous nos produits avec service après-vente</p>
            </div>

            <div class="text-center group">
              <div class="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 group-hover:bg-green-200 transition-colors">
                <lucide-icon name="check" class="w-8 h-8 text-green-600"></lucide-icon>
              </div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">15 Ans d'Expérience</h3>
              <p class="text-gray-600">Plus de 15 ans d'expertise dans le domaine du froid</p>
            </div>
          </div>
        </div>
      </section>

      <!-- Brands Section -->
      <section class="py-16 bg-gray-50" *ngIf="brands.length > 0">
        <div class="container mx-auto px-4">
          <div class="text-center mb-12">
            <h2 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
              Nos Marques Partenaires
            </h2>
            <p class="text-xl text-gray-600">
              Nous travaillons avec les meilleures marques du marché
            </p>
          </div>

          <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-8 items-center">
            <div
              *ngFor="let marque of brands.slice(0, 12)"
              class="flex items-center justify-center p-4 bg-white rounded-lg shadow hover:shadow-lg transition-shadow cursor-pointer"
              (click)="navigateToBrand(marque)">
              <img
                *ngIf="marque.logo"
                [src]="getBrandLogoUrl(marque)"
                [alt]="marque.nomMarque"
                class="max-h-12 max-w-full object-contain"
                onerror="this.style.display='none'">
              <span
                *ngIf="!marque.logo"
                class="text-lg font-semibold text-gray-700">
                {{ marque.nomMarque }}
              </span>
            </div>
          </div>
        </div>
      </section>

      <!-- CTA Section -->
      <section class="py-16 bg-primary-600 text-white">
        <div class="container mx-auto px-4 text-center">
          <h2 class="text-3xl lg:text-4xl font-bold mb-4">
            Besoin d'un Conseil Personnalisé ?
          </h2>
          <p class="text-xl text-primary-100 mb-8 max-w-3xl mx-auto">
            Nos experts sont là pour vous aider à choisir la solution qui correspond parfaitement à vos besoins
          </p>

          <div class="flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <a
              href="tel:+221773352000"
              class="btn-secondary text-lg px-8 py-4">
              <lucide-icon name="phone" class="w-5 h-5"></lucide-icon>
              <span>77 335 20 00</span>
            </a>

            <button
              (click)="navigateToContact()"
              class="btn-outline border-white text-white hover:bg-white hover:text-primary-600 text-lg px-8 py-4">
              <lucide-icon name="mail" class="w-5 h-5"></lucide-icon>
              <span>Nous écrire</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  `
})
export class HomeComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  categories: Categorie[] = [];
  featuredProducts: Produit[] = [];
  brands: Marque[] = [];

  isLoadingCategories = true;
  isLoadingProducts = true;
  isLoadingBrands = true;

  constructor(
    private apiService: ApiService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadHomeData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadHomeData(): void {
    // Charger toutes les données nécessaires en parallèle
    forkJoin({
      categories: this.apiService.getCategories(),
      products: this.apiService.getLatestProduits({ size: 8 }),
      brands: this.apiService.getMarquesWithProducts()
    }).pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.categories = data.categories;
          this.featuredProducts = data.products.content;
          this.brands = data.brands;

          this.isLoadingCategories = false;
          this.isLoadingProducts = false;
          this.isLoadingBrands = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des données d\'accueil:', error);
          this.isLoadingCategories = false;
          this.isLoadingProducts = false;
          this.isLoadingBrands = false;
        }
      });
  }

  navigateToProducts(): void {
    this.router.navigate(['/produits']);
  }

  navigateToContact(): void {
    this.router.navigate(['/contact']);
  }

  navigateToCategory(categorie: Categorie): void {
    this.router.navigate(['/produits/categorie', categorie.idCategorie]);
  }

  navigateToBrand(marque: Marque): void {
    this.router.navigate(['/produits/marque', marque.idMarque]);
  }

  onQuickView(produit: Produit): void {
    // Implémenter la vue rapide (modal ou redirection)
    this.router.navigate(['/produit', produit.idProduit]);
  }

  onWishlistToggle(event: {produit: Produit, isAdding: boolean}): void {
    // Géré automatiquement par le composant product-card
    console.log('Wishlist toggle:', event);
  }

  getCategoryIcon(categorie: Categorie): string {
    // Mapping des icônes selon le nom de la catégorie
    const categoryIcons: {[key: string]: string} = {
      'climatiseur': 'snowflake',
      'climatiseurs': 'snowflake',
      'réfrigérateur': 'refrigerator',
      'réfrigérateurs': 'refrigerator',
      'frigo': 'refrigerator',
      'frigos': 'refrigerator',
      'chambre froide': 'warehouse',
      'chambres froides': 'warehouse',
      'ventilateur': 'fan',
      'ventilateurs': 'fan',
      'électroménager': 'zap',
      'machine à laver': 'washing-machine',
      'lave-vaisselle': 'dishes',
      'micro-onde': 'microwave'
    };

    const categoryName = categorie.nomCategorie.toLowerCase();

    for (const [key, icon] of Object.entries(categoryIcons)) {
      if (categoryName.includes(key)) {
        return icon;
      }
    }

    return 'package'; // Icône par défaut
  }

  getBrandLogoUrl(marque: Marque): string {
    if (marque.logo) {
      return `http://localhost:8080/uploads/${marque.logo}`;
    }
    return '';
  }

  // Méthodes utiles pour l'animation et l'UX
  scrollToSection(sectionId: string): void {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }

  trackByCategory(index: number, categorie: Categorie): number {
    return categorie.idCategorie;
  }

  trackByProduct(index: number, produit: Produit): number {
    return produit.idProduit;
  }

  trackByBrand(index: number, marque: Marque): number {
    return marque.idMarque;
  }
}
