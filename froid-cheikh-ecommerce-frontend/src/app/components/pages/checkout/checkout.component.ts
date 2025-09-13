import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { CartService } from '../../../services/cart.service';
import { ApiService } from '../../../services/api.service';
import { AuthService } from '../../../services/auth.service';
import { ToastService } from '../../../services/toast.service';
import { Cart, Breadcrumb } from '../../../models/interfaces';
// En haut du fichier CheckoutComponent.ts - Vérifier que ces imports sont présents
import { Observable } from 'rxjs';
import { ModeLivraison, Commande } from '../../../models/interfaces';

@Component({
  selector: 'app-checkout',
  template: `
    <div class="min-h-screen bg-gray-50">

      <!-- Breadcrumb -->
      <app-breadcrumb [breadcrumbs]="breadcrumbs"></app-breadcrumb>

      <div class="container mx-auto px-4 py-8">

        <!-- Page Header -->
        <div class="mb-8">
          <h1 class="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
            Finaliser ma commande
          </h1>
          <p class="text-gray-600">
            Vérifiez vos informations et validez votre commande
          </p>
        </div>

        <form [formGroup]="checkoutForm" (ngSubmit)="onSubmit()" *ngIf="cart.items.length > 0">
          <div class="grid grid-cols-1 lg:grid-cols-3 gap-8">

            <!-- Checkout Form -->
            <div class="lg:col-span-2 space-y-6">

              <!-- Customer Information -->
              <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Informations personnelles</h2>

                <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label class="form-label">Prénom *</label>
                    <input
                      type="text"
                      formControlName="prenom"
                      class="form-input"
                      [class.border-red-500]="isFieldInvalid('prenom')">
                    <div *ngIf="isFieldInvalid('prenom')" class="text-red-500 text-sm mt-1">
                      Le prénom est requis
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Nom *</label>
                    <input
                      type="text"
                      formControlName="nom"
                      class="form-input"
                      [class.border-red-500]="isFieldInvalid('nom')">
                    <div *ngIf="isFieldInvalid('nom')" class="text-red-500 text-sm mt-1">
                      Le nom est requis
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Email *</label>
                    <input
                      type="email"
                      formControlName="email"
                      class="form-input"
                      [class.border-red-500]="isFieldInvalid('email')">
                    <div *ngIf="isFieldInvalid('email')" class="text-red-500 text-sm mt-1">
                      <span *ngIf="checkoutForm.get('email')?.errors?.['required']">L'email est requis</span>
                      <span *ngIf="checkoutForm.get('email')?.errors?.['email']">Format d'email invalide</span>
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Téléphone *</label>
                    <input
                      type="tel"
                      formControlName="telephone"
                      placeholder="+221 77 123 45 67"
                      class="form-input"
                      [class.border-red-500]="isFieldInvalid('telephone')">
                    <div *ngIf="isFieldInvalid('telephone')" class="text-red-500 text-sm mt-1">
                      Le téléphone est requis
                    </div>
                  </div>
                </div>
              </div>

              <!-- Delivery Address -->
              <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Adresse de livraison</h2>

                <div class="space-y-4">
                  <div>
                    <label class="form-label">Adresse ligne 1 *</label>
                    <input
                      type="text"
                      formControlName="adresseLigne1"
                      placeholder="Numéro et nom de rue"
                      class="form-input"
                      [class.border-red-500]="isFieldInvalid('adresseLigne1')">
                    <div *ngIf="isFieldInvalid('adresseLigne1')" class="text-red-500 text-sm mt-1">
                      L'adresse est requise
                    </div>
                  </div>

                  <div>
                    <label class="form-label">Adresse ligne 2</label>
                    <input
                      type="text"
                      formControlName="adresseLigne2"
                      placeholder="Complément d'adresse (optionnel)"
                      class="form-input">
                  </div>

                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label class="form-label">Ville *</label>
                      <input
                        type="text"
                        formControlName="ville"
                        class="form-input"
                        [class.border-red-500]="isFieldInvalid('ville')">
                      <div *ngIf="isFieldInvalid('ville')" class="text-red-500 text-sm mt-1">
                        La ville est requise
                      </div>
                    </div>

                    <div>
                      <label class="form-label">Code postal</label>
                      <input
                        type="text"
                        formControlName="codePostal"
                        class="form-input">
                    </div>
                  </div>
                </div>
              </div>

              <!-- Delivery Method -->
              <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Mode de livraison</h2>

                <div class="space-y-3">
                  <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value="LIVRAISON_DOMICILE"
                      formControlName="modeLivraison"
                      class="form-radio text-primary-600">
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-medium text-gray-900">Livraison à domicile</div>
                          <div class="text-sm text-gray-500">Livraison sous 24-48h</div>
                        </div>
                        <div class="text-green-600 font-medium">Gratuit</div>
                      </div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value="LIVRAISON_EXPRESS"
                      formControlName="modeLivraison"
                      class="form-radio text-primary-600">
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-medium text-gray-900">Livraison express</div>
                          <div class="text-sm text-gray-500">Livraison le jour même</div>
                        </div>
                        <div class="text-gray-900 font-medium">5 000 FCFA</div>
                      </div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value="RETRAIT_MAGASIN"
                      formControlName="modeLivraison"
                      class="form-radio text-primary-600">
                    <div class="ml-3 flex-1">
                      <div class="flex items-center justify-between">
                        <div>
                          <div class="font-medium text-gray-900">Retrait en magasin</div>
                          <div class="text-sm text-gray-500">Disponible sous 2h</div>
                        </div>
                        <div class="text-green-600 font-medium">Gratuit</div>
                      </div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Payment Method -->
              <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Mode de paiement</h2>

                <div class="space-y-3">
                  <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value="WAVE"
                      formControlName="methodePaiement"
                      class="form-radio text-primary-600">
                    <div class="ml-3 flex-1">
                      <div class="font-medium text-gray-900">Wave</div>
                      <div class="text-sm text-gray-500">Paiement mobile sécurisé</div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value="ORANGE_MONEY"
                      formControlName="methodePaiement"
                      class="form-radio text-primary-600">
                    <div class="ml-3 flex-1">
                      <div class="font-medium text-gray-900">Orange Money</div>
                      <div class="text-sm text-gray-500">Paiement mobile Orange</div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value="ESPECES"
                      formControlName="methodePaiement"
                      class="form-radio text-primary-600">
                    <div class="ml-3 flex-1">
                      <div class="font-medium text-gray-900">Paiement à la livraison</div>
                      <div class="text-sm text-gray-500">Paiement en espèces</div>
                    </div>
                  </label>

                  <label class="flex items-center p-4 border border-gray-200 rounded-lg cursor-pointer hover:border-primary-300 transition-colors">
                    <input
                      type="radio"
                      value="VIREMENT_BANCAIRE"
                      formControlName="methodePaiement"
                      class="form-radio text-primary-600">
                    <div class="ml-3 flex-1">
                      <div class="font-medium text-gray-900">Virement bancaire</div>
                      <div class="text-sm text-gray-500">Paiement par virement</div>
                    </div>
                  </label>
                </div>
              </div>

              <!-- Comments -->
              <div class="bg-white rounded-xl shadow-lg p-6">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Commentaires (optionnel)</h2>
                <textarea
                  formControlName="commentaire"
                  rows="3"
                  placeholder="Ajoutez un commentaire à votre commande..."
                  class="form-input"></textarea>
              </div>
            </div>

            <!-- Order Summary -->
            <div class="lg:col-span-1">
              <div class="bg-white rounded-xl shadow-lg p-6 sticky top-4">
                <h2 class="text-lg font-semibold text-gray-900 mb-4">Récapitulatif</h2>

                <!-- Cart Items -->
                <div class="space-y-3 mb-4">
                  <div *ngFor="let item of cart.items" class="flex items-center space-x-3">
                    <div class="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <lucide-icon name="package" class="w-6 h-6 text-gray-400"></lucide-icon>
                    </div>
                    <div class="flex-1 min-w-0">
                      <div class="text-sm font-medium text-gray-900 truncate">{{ item.produit.nomProduit }}</div>
                      <div class="text-xs text-gray-500">Qté: {{ item.quantite }}</div>
                    </div>
                    <div class="text-sm font-medium text-gray-900">
                      {{ item.sousTotal | currency:'XOF':'symbol':'1.0-0' }}
                    </div>
                  </div>
                </div>

                <!-- Price Breakdown -->
                <div class="border-t border-gray-200 pt-4 space-y-2">
                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Sous-total</span>
                    <span class="font-medium">{{ cart.totalPrice | currency:'XOF':'symbol':'1.0-0' }}</span>
                  </div>

                  <div class="flex justify-between text-sm">
                    <span class="text-gray-600">Frais de livraison</span>
                    <span class="font-medium" [class]="getDeliveryFees() > 0 ? 'text-gray-900' : 'text-green-600'">
                      {{ getDeliveryFees() > 0 ? (getDeliveryFees() | currency:'XOF':'symbol':'1.0-0') : 'Gratuit' }}
                    </span>
                  </div>

                  <div class="border-t border-gray-200 pt-2">
                    <div class="flex justify-between text-lg font-bold">
                      <span class="text-gray-900">Total</span>
                      <span class="text-primary-600">{{ getTotalWithDelivery() | currency:'XOF':'symbol':'1.0-0' }}</span>
                    </div>
                  </div>
                </div>

                <!-- Submit Button -->
                <button
                  type="submit"
                  [disabled]="isSubmitting || !checkoutForm.valid"
                  class="w-full btn-primary py-3 text-lg mt-6 disabled:opacity-50 disabled:cursor-not-allowed">
                  <div *ngIf="isSubmitting" class="flex items-center justify-center space-x-2">
                    <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Traitement...</span>
                  </div>
                  <div *ngIf="!isSubmitting" class="flex items-center justify-center space-x-2">
                    <lucide-icon name="credit-card" class="w-5 h-5"></lucide-icon>
                    <span>Valider ma commande</span>
                  </div>
                </button>

                <!-- Security Info -->
                <div class="mt-4 pt-4 border-t border-gray-200">
                  <div class="flex items-center space-x-2 text-sm text-gray-600">
                    <lucide-icon name="shield" class="w-4 h-4 text-green-500"></lucide-icon>
                    <span>Commande 100% sécurisée</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>

        <!-- Empty Cart -->
        <div *ngIf="cart.items.length === 0" class="text-center py-16">
          <lucide-icon name="shopping-cart" class="w-24 h-24 text-gray-300 mx-auto mb-6"></lucide-icon>
          <h2 class="text-2xl font-semibold text-gray-900 mb-4">Votre panier est vide</h2>
          <p class="text-gray-600 mb-8">Ajoutez des produits à votre panier pour passer une commande.</p>
          <button (click)="goToProducts()" class="btn-primary">
            <lucide-icon name="arrow-left" class="w-5 h-5"></lucide-icon>
            <span>Continuer mes achats</span>
          </button>
        </div>
      </div>
    </div>
  `
})
export class CheckoutComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  checkoutForm: FormGroup;
  cart: Cart = { items: [], totalItems: 0, totalPrice: 0 };
  isSubmitting = false;

  // ✅ AJOUT DE LA PROPRIÉTÉ MANQUANTE
  isAuthenticated = false;

  breadcrumbs: Breadcrumb[] = [
    { label: 'Accueil', route: '/' },
    { label: 'Mon Panier', route: '/panier' },
    { label: 'Commande', route: undefined }
  ];

  constructor(
    private fb: FormBuilder,
    private cartService: CartService,
    private apiService: ApiService,
    private authService: AuthService,
    private toastService: ToastService,
    private router: Router
  ) {
    this.checkoutForm = this.createCheckoutForm();
  }

  ngOnInit(): void {
    console.log('🔍 === CHECKOUT COMPONENT INIT ===');

    this.loadCart();
    this.checkAuthentication();
    this.prefillUserData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private createCheckoutForm(): FormGroup {
    return this.fb.group({
      // Informations client
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.required]],

      // Adresse de livraison
      adresseLigne1: ['', [Validators.required]],
      adresseLigne2: [''],
      ville: ['', [Validators.required]],
      codePostal: [''],

      // Options
      modeLivraison: ['LIVRAISON_DOMICILE', [Validators.required]],
      methodePaiement: ['WAVE', [Validators.required]],
      commentaire: ['']
    });
  }

  private loadCart(): void {
    this.cartService.cart$
      .pipe(takeUntil(this.destroy$))
      .subscribe(cart => {
        this.cart = cart;
      });
  }

  // ✅ NOUVELLE MÉTHODE POUR VÉRIFIER L'AUTHENTIFICATION
  private checkAuthentication(): void {
    this.isAuthenticated = this.authService.isAuthenticated();
    console.log('🔐 Utilisateur authentifié:', this.isAuthenticated);

    if (this.isAuthenticated) {
      const userData = this.authService.getCurrentUser();
      console.log('👤 Données utilisateur:', userData);
    }
  }

  // ✅ MÉTHODE PREFILL AMÉLIORÉE
  private prefillUserData(): void {
    console.log('🔄 Pré-remplissage des données utilisateur...');

    if (this.isAuthenticated) {
      // Récupérer les données du token ou faire un appel API
      const userData = this.authService.getCurrentUser();

      if (userData) {
        console.log('👤 Données utilisateur trouvées:', userData);

        this.checkoutForm.patchValue({
          nom: userData.nom || '',
          prenom: userData.prenom || '',
          email: userData.email || '',
        });

        // Désactiver l'email pour les utilisateurs connectés
        this.checkoutForm.get('email')?.disable();

        console.log('✅ Données pré-remplies pour utilisateur connecté');
      } else {
        console.log('⚠️ Utilisateur connecté mais pas de données dans le token');
        // Charger le profil depuis l'API
        this.loadUserProfile();
      }
    } else {
      console.log('🔓 Utilisateur invité - pas de pré-remplissage');
    }
  }

  // ✅ NOUVELLE MÉTHODE POUR CHARGER LE PROFIL
  private loadUserProfile(): void {
    if (this.isAuthenticated) {
      this.apiService.getProfile()
        .pipe(takeUntil(this.destroy$))
        .subscribe({
          next: (profile) => {
            console.log('👤 Profil chargé depuis l\'API:', profile);

            this.checkoutForm.patchValue({
              nom: profile.nom,
              prenom: profile.prenom,
              email: profile.email,
              telephone: profile.telephone || ''
            });

            // Désactiver l'email
            this.checkoutForm.get('email')?.disable();
          },
          error: (error) => {
            console.error('❌ Erreur lors du chargement du profil:', error);
            // Ne pas bloquer l'utilisateur si le profil ne peut pas être chargé
          }
        });
    }
  }

  onSubmit(): void {
    console.log('🚀 === DÉBUT SOUMISSION COMMANDE ===');

    // ✅ MISE À JOUR DE L'ÉTAT D'AUTHENTIFICATION
    this.checkAuthentication();

    // Réactiver temporairement l'email pour validation si connecté
    if (this.isAuthenticated) {
      this.checkoutForm.get('email')?.enable();
    }

    // Validation du formulaire
    if (!this.checkoutForm.valid) {
      this.markFormGroupTouched(this.checkoutForm);
      this.toastService.error('Erreur', 'Veuillez remplir tous les champs obligatoires');

      if (this.isAuthenticated) {
        this.checkoutForm.get('email')?.disable();
      }
      return;
    }

    // Validation du panier
    if (this.cart.items.length === 0) {
      this.toastService.error('Erreur', 'Votre panier est vide');
      return;
    }

    this.isSubmitting = true;
    const formData = this.checkoutForm.value;

    // ✅ STRUCTURE DE BASE COMMUNE
    const baseCommandeData: Partial<Commande> = {
      // Adresse de livraison
      adresseLivraison: {
        nom: formData.nom,
        prenom: formData.prenom,
        ligne1: formData.adresseLigne1,
        ligne2: formData.adresseLigne2 || '',
        ville: formData.ville,
        codePostal: formData.codePostal || '',
        telephone: formData.telephone
      },

      // Options de commande
      modeLivraison: formData.modeLivraison as ModeLivraison,
      commentaire: formData.commentaire || '',

      // Articles du panier
      lignesCommande: this.cart.items.map(item => ({
        produitId: item.produit.idProduit,
        quantite: item.quantite,
        prixUnitaire: item.produit.prix,
        sousTotal: item.sousTotal
      }))
    };

    let commandeObservable: Observable<Commande>;

    if (this.isAuthenticated) {
      // ✅ COMMANDE CLIENT AUTHENTIFIÉ
      console.log('👤 === CRÉATION COMMANDE CLIENT AUTHENTIFIÉ ===');
      commandeObservable = this.apiService.creerCommandeClient(baseCommandeData);
    } else {
      // ✅ COMMANDE INVITÉ - Ajouter les données spécifiques
      console.log('🔓 === CRÉATION COMMANDE INVITÉ ===');
      const commandeInviteData = {
        ...baseCommandeData,
        // Données spécifiques aux invités
        emailInvite: formData.email,
        nomInvite: formData.nom,
        prenomInvite: formData.prenom,
        telephoneInvite: formData.telephone
      };

      console.log('📧 Email invité:', formData.email);
      console.log('👤 Nom invité:', formData.nom, formData.prenom);

      commandeObservable = this.apiService.creerCommandeInvite(commandeInviteData);
    }

    console.log('📤 Envoi de la commande...');
    console.log('🛒 Nombre d\'articles:', this.cart.items.length);
    console.log('💰 Total:', this.getTotalWithDelivery());

    // Exécution de la commande
    commandeObservable
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (response: Commande) => {
          console.log('✅ === COMMANDE CRÉÉE AVEC SUCCÈS ===');
          console.log('🔢 ID:', response.idCommande);
          console.log('📄 Numéro:', response.numeroCommande);
          console.log('👤 Client ID:', response.clientId);
          console.log('📧 Email invité:', response.emailInvite);

          this.isSubmitting = false;

          // Vider le panier
          this.cartService.clearCart();

          // Message de succès
          this.toastService.success(
            'Commande créée !',
            `Votre commande ${response.numeroCommande} a été créée avec succès`
          );

          // Redirection vers la page de détail de la commande
          if (response.idCommande) {
            this.router.navigate(['/commande', response.idCommande]);
          } else {
            // Fallback si pas d'ID
            this.router.navigate(['/commandes']);
          }
        },
        error: (error) => {
          console.error('❌ === ERREUR CRÉATION COMMANDE ===');
          console.error('Error object:', error);
          console.error('Error status:', error.status);
          console.error('Error message:', error.message);

          this.isSubmitting = false;

          // Gestion des erreurs avec messages détaillés
          let errorMessage = 'Une erreur s\'est produite lors de la création de votre commande';

          if (error.error) {
            if (typeof error.error === 'string') {
              errorMessage = error.error;
            } else if (error.error.message) {
              errorMessage = error.error.message;
            } else if (error.error.details) {
              errorMessage = 'Erreurs de validation détectées';
              console.error('Détails des erreurs:', error.error.details);
            }
          }

          // Erreurs spécifiques selon le status
          if (error.status === 401) {
            errorMessage = 'Vous devez être connecté pour passer une commande client';
          } else if (error.status === 403) {
            errorMessage = 'Vous n\'avez pas les permissions nécessaires';
          } else if (error.status === 400) {
            errorMessage = 'Les données de la commande sont invalides';
          }

          this.toastService.error('Erreur', errorMessage);

          // Réactiver les champs si connecté
          if (this.isAuthenticated) {
            this.checkoutForm.get('email')?.disable();
          }
        }
      });
  }

  // Helper methods
  isFieldInvalid(fieldName: string): boolean {
    const field = this.checkoutForm.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  getDeliveryFees(): number {
    const modeLivraison = this.checkoutForm.get('modeLivraison')?.value;
    return modeLivraison === 'LIVRAISON_EXPRESS' ? 5000 : 0;
  }

  getTotalWithDelivery(): number {
    return this.cart.totalPrice + this.getDeliveryFees();
  }

  goToProducts(): void {
    this.router.navigate(['/produits']);
  }
}
