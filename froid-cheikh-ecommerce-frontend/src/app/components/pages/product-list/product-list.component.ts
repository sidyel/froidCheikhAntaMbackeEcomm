import { Component, OnInit, OnDestroy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subject, combineLatest } from 'rxjs';
import { takeUntil, debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ApiService } from '../../../services/api.service';
import { Produit, Categorie, Marque, PagedResponse, ProductFilters, SearchParams } from '../../../models/interfaces';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-product-list',
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Breadcrumb -->
      <app-breadcrumb [breadcrumbs]="breadcrumbs"></app-breadcrumb>

      <div class="container mx-auto px-4 py-8">

        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            {{ getPageTitle() }}
          </h1>
          <p class="text-xl text-gray-600" *ngIf="getPageDescription()">
            {{ getPageDescription() }}
          </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-4 gap-8">

          <!-- Sidebar Filters -->
          <div class="lg:col-span-1">
            <div class="bg-white rounded-xl shadow-lg p-6 sticky top-4">

              <!-- Mobile Filter Toggle -->
              <div class="lg:hidden mb-4">
                <button
                  (click)="toggleMobileFilters()"
                  class="w-full flex items-center justify-between p-3 bg-gray-100 rounded-lg">
                  <span class="flex items-center space-x-2">
                    <lucide-icon name="filter" class="w-5 h-5"></lucide-icon>
                    <span class="font-medium">Filtres</span>
                  </span>
                  <lucide-icon
                    [name]="showMobileFilters ? 'chevron-up' : 'chevron-down'"
                    class="w-5 h-5">
                  </lucide-icon>
                </button>
              </div>

              <!-- Filters Form -->
              <form [formGroup]="filtersForm"
                    [class.hidden]="!showMobileFilters"
                    [class.lg:block]="true"
                    class="space-y-6">

                <!-- Price Range -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Prix</h3>
                  <div class="space-y-3">
                    <div class="grid grid-cols-2 gap-3">
                      <div>
                        <label class="form-label">Min (FCFA)</label>
                        <input
                          type="number"
                          formControlName="prixMin"
                          placeholder="0"
                          class="form-input">
                      </div>
                      <div>
                        <label class="form-label">Max (FCFA)</label>
                        <input
                          type="number"
                          formControlName="prixMax"
                          placeholder="999999"
                          class="form-input">
                      </div>
                    </div>
                  </div>
                </div>

                <!-- Categories -->
                <div *ngIf="categories.length > 0">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Catégories</h3>
                  <div class="space-y-2 max-h-48 overflow-y-auto">
                    <label *ngFor="let categorie of categories"
                           class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        [value]="categorie.idCategorie"
                        formControlName="categorieId"
                        class="form-radio text-primary-600">
                      <span class="text-sm text-gray-700">{{ categorie.nomCategorie }}</span>
                      <span class="text-xs text-gray-500" *ngIf="categorie.nombreProduits">
                        ({{ categorie.nombreProduits }})
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Brands -->
                <div *ngIf="brands.length > 0">
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Marques</h3>
                  <div class="space-y-2 max-h-48 overflow-y-auto">
                    <label *ngFor="let marque of brands"
                           class="flex items-center space-x-2 cursor-pointer hover:bg-gray-50 p-2 rounded">
                      <input
                        type="radio"
                        [value]="marque.idMarque"
                        formControlName="marqueId"
                        class="form-radio text-primary-600">
                      <span class="text-sm text-gray-700">{{ marque.nomMarque }}</span>
                      <span class="text-xs text-gray-500" *ngIf="marque.nombreProduits">
                        ({{ marque.nombreProduits }})
                      </span>
                    </label>
                  </div>
                </div>

                <!-- Availability -->
                <div>
                  <h3 class="text-lg font-semibold text-gray-900 mb-3">Disponibilité</h3>
                  <label class="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      formControlName="disponibilite"
                      class="form-checkbox text-primary-600">
                    <span class="text-sm text-gray-700">Produits disponibles uniquement</span>
                  </label>
                </div>

                <!-- Filter Actions -->
                <div class="border-t pt-4 space-y-3">
                  <button
                    type="button"
                    (click)="clearFilters()"
                    class="w-full btn-outline text-sm py-2">
                    Effacer les filtres
                  </button>
                </div>
              </form>
            </div>
          </div>

          <!-- Main Content -->
          <div class="lg:col-span-3">

            <!-- Toolbar -->
            <div class="bg-white rounded-xl shadow-lg p-4 mb-6">
              <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">

                <!-- Results Info -->
                <div class="text-sm text-gray-600">
                  <span *ngIf="productsResponse">
                    {{ productsResponse.totalElements }} produit{{ productsResponse.totalElements > 1 ? 's' : '' }} trouvé{{ productsResponse.totalElements > 1 ? 's' : '' }}
                  </span>
                  <span *ngIf="searchQuery" class="font-medium">
                    pour "{{ searchQuery }}"
                  </span>
                </div>

                <!-- Sort and View Options -->
                <div class="flex items-center space-x-4">
                  <!-- Sort -->
                  <div class="flex items-center space-x-2">
                    <label class="text-sm text-gray-700">Trier par:</label>
                    <select
                      [(ngModel)]="sortOption"
                      (ngModelChange)="onSortChange()"
                      class="form-input text-sm py-2">
                      <option value="dateAjout-desc">Plus récents</option>
                      <option value="prix-asc">Prix croissant</option>
                      <option value="prix-desc">Prix décroissant</option>
                      <option value="nomProduit-asc">Nom A-Z</option>
                      <option value="nomProduit-desc">Nom Z-A</option>
                    </select>
                  </div>

                  <!-- View Mode -->
                  <div class="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
                    <button
                      (click)="setViewMode('grid')"
                      [class]="viewMode === 'grid' ? 'bg-white shadow-sm' : ''"
                      class="p-2 rounded transition-all">
                      <lucide-icon name="grid" class="w-4 h-4"></lucide-icon>
                    </button>
                    <button
                      (click)="setViewMode('list')"
                      [class]="viewMode === 'list' ? 'bg-white shadow-sm' : ''"
                      class="p-2 rounded transition-all">
                      <lucide-icon name="list" class="w-4 h-4"></lucide-icon>
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <!-- Products Grid/List -->
            <div *ngIf="!isLoading && products.length > 0">

              <!-- Grid View -->
              <div *ngIf="viewMode === 'grid'" class="products-grid">
                <app-product-card
                  *ngFor="let produit of products; trackBy: trackByProduct"
                  [produit]="produit"
                  (quickView)="onQuickView($event)"
                  (wishlistToggle)="onWishlistToggle($event)">
                </app-product-card>
              </div>

              <!-- List View -->
              <div *ngIf="viewMode === 'list'" class="space-y-4">
                <div
                  *ngFor="let produit of products; trackBy: trackByProduct"
                  class="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
                  <div class="flex flex-col md:flex-row">
                    <!-- Product Image -->
                    <div class="md:w-1/4 flex-shrink-0">
                      <img
                        [src]="getProductImageUrl(produit)"
                        [alt]="produit.nomProduit"
                        class="w-full h-48 md:h-full object-cover cursor-pointer"
                        (click)="navigateToProduct(produit)"
                        onerror="this.src='assets/images/placeholder-product.jpg'">
                    </div>

                    <!-- Product Info -->
                    <div class="flex-1 p-6">
                      <div class="flex justify-between items-start mb-4">
                        <div class="flex-1">
                          <div class="flex items-center space-x-2 mb-2">
                            <span *ngIf="produit.marque" class="text-sm text-gray-500">
                              {{ produit.marque.nomMarque }}
                            </span>
                            <span *ngIf="produit.refProduit" class="text-xs text-gray-400">
                              {{ produit.refProduit }}
                            </span>
                          </div>

                          <h3
                            class="text-xl font-semibold text-gray-900 mb-2 cursor-pointer hover:text-primary-600 transition-colors"
                            (click)="navigateToProduct(produit)">
                            {{ produit.nomProduit }}
                          </h3>

                          <p *ngIf="produit.descriptionProduit"
                             class="text-gray-600 line-clamp-2 mb-4">
                            {{ produit.descriptionProduit }}
                          </p>

                          <!-- Technical Info -->
                          <div class="flex flex-wrap gap-2 mb-4">
                            <span *ngIf="produit.puissanceBTU"
                                  class="badge badge-info">
                              {{ produit.puissanceBTU }} BTU
                            </span>
                            <span *ngIf="produit.labelEnergie"
                                  class="badge badge-success">
                              Classe {{ produit.labelEnergie.replace('_PLUS', '+') }}
                            </span>
                          </div>
                        </div>

                        <!-- Price and Actions -->
                        <div class="text-right">
                          <div class="text-2xl font-bold text-primary-600 mb-4">
                            {{ produit.prix | currency:'XOF':'symbol':'1.0-0' }}
                          </div>

                          <div class="space-y-2">
                            <button
                              (click)="addToCart(produit)"
                              [disabled]="!produit.disponibilite || produit.stockDisponible === 0"
                              class="w-full btn-primary disabled:opacity-50">
                              <lucide-icon name="shopping-cart" class="w-4 h-4"></lucide-icon>
                              <span>Ajouter au panier</span>
                            </button>

                            <button
                              (click)="navigateToProduct(produit)"
                              class="w-full btn-outline">
                              <lucide-icon name="eye" class="w-4 h-4"></lucide-icon>
                              <span>Voir détails</span>
                            </button>
                          </div>

                          <!-- Stock Info -->
                          <div class="mt-2 text-sm">
                            <span *ngIf="produit.disponibilite && produit.stockDisponible > 0"
                                  class="text-green-600">
                              En stock ({{ produit.stockDisponible }})
                            </span>
                            <span *ngIf="!produit.disponibilite || produit.stockDisponible === 0"
                                  class="text-red-600">
                              Indisponible
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Loading State -->
            <div *ngIf="isLoading" class="products-grid">
              <div *ngFor="let i of [1,2,3,4,5,6,7,8,9,10,11,12]" class="animate-pulse">
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

            <!-- No Results -->
            <div *ngIf="!isLoading && products.length === 0"
                 class="text-center py-16">
              <div class="max-w-md mx-auto">
                <lucide-icon name="package" class="w-24 h-24 text-gray-300 mx-auto mb-4"></lucide-icon>
                <h3 class="text-xl font-semibold text-gray-900 mb-2">
                  Aucun produit trouvé
                </h3>
                <p class="text-gray-600 mb-6">
                  Essayez de modifier vos critères de recherche ou explorez nos catégories.
                </p>
                <button
                  (click)="clearFilters()"
                  class="btn-primary">
                  Effacer les filtres
                </button>
              </div>
            </div>

            <!-- Pagination -->
            <app-pagination
              *ngIf="productsResponse && productsResponse.totalElements > 0"
              [currentPage]="currentPage"
              [totalPages]="productsResponse.totalPages"
              [totalElements]="productsResponse.totalElements"
              [pageSize]="pageSize"
              (pageChange)="onPageChange($event)"
              (pageSizeChange)="onPageSizeChange($event)">
            </app-pagination>
          </div>
        </div>
      </div>
    </div>
  `
})
export class ProductListComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  // Data
  products: Produit[] = [];
  productsResponse: PagedResponse<Produit> | null = null;
  categories: Categorie[] = [];
  brands: Marque[] = [];
  breadcrumbs: any[] = [];

  // Form and filters
  filtersForm: FormGroup;

  // Search and pagination
  searchQuery = '';
  currentPage = 0;
  pageSize = environment.pagination.defaultPageSize;
  sortOption = 'dateAjout-desc';

  // UI state
  isLoading = true;
  viewMode: 'grid' | 'list' = 'grid';
  showMobileFilters = false;

  // Route parameters
  currentCategoryId: number | null = null;
  currentMarqueId: number | null = null;

  constructor(
    private apiService: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private fb: FormBuilder
  ) {
    this.filtersForm = this.createFiltersForm();
  }

  ngOnInit(): void {
    this.initializeComponent();
    this.setupFormSubscriptions();
    this.setupRouteSubscriptions();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createFiltersForm(): FormGroup {
    return this.fb.group({
      prixMin: [null],
      prixMax: [null],
      categorieId: [null],
      marqueId: [null],
      disponibilite: [true]
    });
  }

  private initializeComponent(): void {
    this.loadStaticData();
  }

  private loadStaticData(): void {
    // Charger les catégories et marques pour les filtres
    this.apiService.getCategories()
      .pipe(takeUntil(this.destroy$))
      .subscribe(categories => {
        this.categories = categories;
      });

    this.apiService.getMarquesWithProducts()
      .pipe(takeUntil(this.destroy$))
      .subscribe(brands => {
        this.brands = brands;
      });
  }

  private setupFormSubscriptions(): void {
    // Écouter les changements de filtres
    this.filtersForm.valueChanges
      .pipe(
        debounceTime(500),
        distinctUntilChanged(),
        takeUntil(this.destroy$)
      )
      .subscribe(() => {
        this.currentPage = 0; // Reset page
        this.loadProducts();
      });
  }

  private setupRouteSubscriptions(): void {
    combineLatest([
      this.route.params,
      this.route.queryParams
    ]).pipe(takeUntil(this.destroy$))
      .subscribe(([params, queryParams]) => {
        this.handleRouteChanges(params, queryParams);
      });
  }

  private handleRouteChanges(params: any, queryParams: any): void {
    // Reset filters
    this.filtersForm.patchValue({
      categorieId: null,
      marqueId: null
    }, { emitEvent: false });

    // Handle category route
    if (params['id'] && this.router.url.includes('/categorie/')) {
      this.currentCategoryId = +params['id'];
      this.filtersForm.patchValue({
        categorieId: this.currentCategoryId
      }, { emitEvent: false });
    }

    // Handle brand route
    if (params['id'] && this.router.url.includes('/marque/')) {
      this.currentMarqueId = +params['id'];
      this.filtersForm.patchValue({
        marqueId: this.currentMarqueId
      }, { emitEvent: false });
    }

    // Handle search
    if (queryParams['q']) {
      this.searchQuery = queryParams['q'];
    }

    // Handle page
    if (queryParams['page']) {
      this.currentPage = +queryParams['page'];
    }

    this.updateBreadcrumbs();
    this.loadProducts();
  }

  private updateBreadcrumbs(): void {
    this.breadcrumbs = [
      { label: 'Accueil', route: '/' },
      { label: 'Produits', route: '/produits' }
    ];

    if (this.currentCategoryId) {
      const categorie = this.categories.find(c => c.idCategorie === this.currentCategoryId);
      if (categorie) {
        this.breadcrumbs.push({
          label: categorie.nomCategorie,
          route: null
        });
      }
    }

    if (this.currentMarqueId) {
      const marque = this.brands.find(m => m.idMarque === this.currentMarqueId);
      if (marque) {
        this.breadcrumbs.push({
          label: marque.nomMarque,
          route: null
        });
      }
    }

    if (this.searchQuery) {
      this.breadcrumbs.push({
        label: `Recherche: "${this.searchQuery}"`,
        route: null
      });
    }
  }

  private loadProducts(): void {
    this.isLoading = true;

    const [sortBy, sortDir] = this.sortOption.split('-');
    const filters = this.getActiveFilters();

    const searchParams: SearchParams = {
      page: this.currentPage,
      size: this.pageSize,
      sortBy,
      sortDir: sortDir as 'asc' | 'desc',
      q: this.searchQuery || undefined,
      filters
    };

    let apiCall;

    if (this.currentCategoryId) {
      apiCall = this.apiService.getProduitsByCategorie(this.currentCategoryId, searchParams);
    } else if (this.currentMarqueId) {
      apiCall = this.apiService.getProduitsByMarque(this.currentMarqueId, searchParams);
    } else {
      apiCall = this.apiService.getProduits(searchParams);
    }

    apiCall.pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response) => {
          this.productsResponse = response;
          this.products = response.content;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Erreur lors du chargement des produits:', error);
          this.isLoading = false;
        }
      });
  }

  private getActiveFilters(): ProductFilters {
    const formValue = this.filtersForm.value;
    const filters: ProductFilters = {};

    if (formValue.prixMin) filters.prixMin = formValue.prixMin;
    if (formValue.prixMax) filters.prixMax = formValue.prixMax;
    if (formValue.categorieId) filters.categorieId = formValue.categorieId;
    if (formValue.marqueId) filters.marqueId = formValue.marqueId;
    if (formValue.disponibilite) filters.disponibilite = formValue.disponibilite;

    return filters;
  }

  // Event handlers
  onPageChange(page: number): void {
    this.currentPage = page;
    this.loadProducts();
    this.scrollToTop();
  }

  onPageSizeChange(size: number): void {
    this.pageSize = size;
    this.currentPage = 0;
    this.loadProducts();
  }

  onSortChange(): void {
    this.currentPage = 0;
    this.loadProducts();
  }

  setViewMode(mode: 'grid' | 'list'): void {
    this.viewMode = mode;
  }

  toggleMobileFilters(): void {
    this.showMobileFilters = !this.showMobileFilters;
  }

  clearFilters(): void {
    this.filtersForm.reset({
      disponibilite: true
    });
    this.searchQuery = '';
    this.currentPage = 0;
  }

  // Navigation
  navigateToProduct(produit: Produit): void {
    this.router.navigate(['/produit', produit.idProduit]);
  }

  onQuickView(produit: Produit): void {
    this.navigateToProduct(produit);
  }

  onWishlistToggle(event: any): void {
    // Géré par le composant product-card
  }

  addToCart(produit: Produit): void {
    // Géré par le composant product-card
  }

  // Helper methods
  getPageTitle(): string {
    if (this.currentCategoryId) {
      const categorie = this.categories.find(c => c.idCategorie === this.currentCategoryId);
      return categorie ? categorie.nomCategorie : 'Nos Produits';
    }

    if (this.currentMarqueId) {
      const marque = this.brands.find(m => m.idMarque === this.currentMarqueId);
      return marque ? `Produits ${marque.nomMarque}` : 'Nos Produits';
    }

    if (this.searchQuery) {
      return `Résultats de recherche`;
    }

    return 'Nos Produits';
  }

  getPageDescription(): string {
    if (this.currentCategoryId) {
      const categorie = this.categories.find(c => c.idCategorie === this.currentCategoryId);
      return categorie?.descriptionCategorie || '';
    }

    if (this.searchQuery) {
      return `Résultats pour "${this.searchQuery}"`;
    }

    return 'Découvrez notre gamme complète de produits de climatisation et d\'électroménager';
  }

  getProductImageUrl(produit: Produit): string {
    if (produit.listeImages && produit.listeImages.length > 0) {
      const imagePath = produit.listeImages[0];
      console.log('🖼️  Image path from DB:', imagePath);

      if (imagePath.startsWith('http')) {
        return imagePath;
      }

      // CORRECTION: URL directe
      const fullUrl = `http://localhost:8080/uploads/${imagePath}`;
      console.log('🔗 Full URL:', fullUrl);
      return fullUrl;
    }
    return 'assets/images/placeholder-product.jpg';
  }

  trackByProduct(index: number, produit: Produit): number {
    return produit.idProduit;
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
