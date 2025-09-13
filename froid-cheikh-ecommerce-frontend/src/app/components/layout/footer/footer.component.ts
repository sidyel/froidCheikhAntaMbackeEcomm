import { Component } from '@angular/core';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-footer',
  template: `
    <footer class="bg-gray-900 text-white">
      <!-- Main Footer -->
      <div class="container mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">

          <!-- Company Info -->
          <div class="space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-lg">FC</span>
              </div>
              <div>
                <h3 class="text-xl font-bold">Froid Cheikh</h3>
                <p class="text-gray-300 text-sm">Anta Mbacké</p>
              </div>
            </div>
            <p class="text-gray-300 text-sm leading-relaxed">
              Spécialiste en climatisation, réfrigération et électroménager depuis plus de 15 ans au Sénégal.
            </p>
            <div class="flex items-center space-x-2 text-sm">
              <lucide-icon name="map-pin" class="w-4 h-4 text-primary-400"></lucide-icon>
              <span class="text-gray-300">{{ companyInfo.address }}</span>
            </div>
            <div class="text-sm">
              <p class="text-gray-400">NINEA: {{ companyInfo.ninea }}</p>
            </div>
          </div>

          <!-- Quick Links -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold">Liens Rapides</h4>
            <nav class="space-y-2">
              <a routerLink="/"
                 class="block text-gray-300 hover:text-white transition-colors">
                Accueil
              </a>
              <a routerLink="/produits"
                 class="block text-gray-300 hover:text-white transition-colors">
                Nos Produits
              </a>
              <a routerLink="/a-propos"
                 class="block text-gray-300 hover:text-white transition-colors">
                À Propos
              </a>
              <a routerLink="/contact"
                 class="block text-gray-300 hover:text-white transition-colors">
                Contact
              </a>
            </nav>
          </div>

          <!-- Categories -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold">Nos Catégories</h4>
            <nav class="space-y-2">
              <a routerLink="/produits/categorie/1"
                 class="block text-gray-300 hover:text-white transition-colors">
                Climatiseurs
              </a>
              <a routerLink="/produits/categorie/2"
                 class="block text-gray-300 hover:text-white transition-colors">
                Réfrigérateurs
              </a>
              <a routerLink="/produits/categorie/3"
                 class="block text-gray-300 hover:text-white transition-colors">
                Chambres Froides
              </a>
              <a routerLink="/produits/categorie/4"
                 class="block text-gray-300 hover:text-white transition-colors">
                Ventilateurs
              </a>
              <a routerLink="/produits/categorie/5"
                 class="block text-gray-300 hover:text-white transition-colors">
                Électroménager
              </a>
            </nav>
          </div>

          <!-- Contact Info -->
          <div class="space-y-4">
            <h4 class="text-lg font-semibold">Nous Contacter</h4>
            <div class="space-y-3">
              <div *ngFor="let phone of companyInfo.phones"
                   class="flex items-center space-x-2">
                <lucide-icon name="phone" class="w-4 h-4 text-primary-400"></lucide-icon>
                <a [href]="'tel:'"
                   class="text-gray-300 hover:text-white transition-colors">
                  {{ phone }}
                </a>
              </div>
              <div class="flex items-center space-x-2" *ngIf="companyInfo.email">
                <lucide-icon name="mail" class="w-4 h-4 text-primary-400"></lucide-icon>
                <a [href]="'mailto:' + companyInfo.email"
                   class="text-gray-300 hover:text-white transition-colors">
                  {{ companyInfo.email }}
                </a>
              </div>
            </div>

            <!-- Business Hours -->
            <div class="mt-6">
              <h5 class="font-semibold mb-2">Horaires d'ouverture</h5>
              <div class="text-sm text-gray-300 space-y-1">
                <div class="flex justify-between">
                  <span>Lun - Ven:</span>
                  <span>8h00 - 18h00</span>
                </div>
                <div class="flex justify-between">
                  <span>Samedi:</span>
                  <span>8h00 - 17h00</span>
                </div>
                <div class="flex justify-between">
                  <span>Dimanche:</span>
                  <span>Fermé</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Newsletter Section -->
      <div class="bg-gray-800 border-t border-gray-700">
        <div class="container mx-auto px-4 py-8">
          <div class="max-w-2xl mx-auto text-center">
            <h3 class="text-xl font-semibold mb-2">Restez Informé</h3>
            <p class="text-gray-300 mb-6">
              Recevez nos dernières offres et nouveautés directement dans votre boîte mail.
            </p>
            <form class="flex flex-col sm:flex-row gap-4 max-w-md mx-auto"
                  (ngSubmit)="onNewsletterSubmit()" #newsletterForm="ngForm">
              <input
                type="email"
                name="email"
                [(ngModel)]="newsletterEmail"
                placeholder="Votre adresse email"
                required
                class="flex-1 px-4 py-3 rounded-lg bg-gray-700 border border-gray-600 text-white placeholder-gray-400 focus:ring-2 focus:ring-primary-500 focus:border-transparent">
              <button
                type="submit"
                [disabled]="!newsletterForm.valid || isNewsletterLoading"
                class="btn-primary whitespace-nowrap">
                <lucide-icon name="mail" class="w-4 h-4" *ngIf="!isNewsletterLoading"></lucide-icon>
                <div class="spinner" *ngIf="isNewsletterLoading"></div>
                <span>S'abonner</span>
              </button>
            </form>
          </div>
        </div>
      </div>

      <!-- Bottom Footer -->
      <div class="bg-gray-800 border-t border-gray-700">
        <div class="container mx-auto px-4 py-6">
          <div class="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <div class="text-gray-400 text-sm">
              © {{ currentYear }} Froid Cheikh Anta Mbacké. Tous droits réservés.
            </div>

            <!-- Payment Methods -->
            <div class="flex items-center space-x-4">
              <span class="text-gray-400 text-sm">Moyens de paiement:</span>
              <div class="flex items-center space-x-2">
                <div class="bg-orange-500 text-white px-2 py-1 rounded text-xs font-semibold">
                  WAVE
                </div>
                <div class="bg-orange-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  Orange Money
                </div>
                <div class="bg-blue-600 text-white px-2 py-1 rounded text-xs font-semibold">
                  Virement
                </div>
              </div>
            </div>

            <!-- Social Links (if needed later) -->
            <div class="flex items-center space-x-4">
              <span class="text-gray-400 text-sm">Suivez-nous:</span>
              <div class="flex space-x-2">
                <!-- Social media links can be added here -->
                <a href="#" class="text-gray-400 hover:text-white transition-colors p-2">
                  <span class="text-xs">Facebook</span>
                </a>
                <a href="#" class="text-gray-400 hover:text-white transition-colors p-2">
                  <span class="text-xs">WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Legal Links -->
      <div class="bg-gray-900 border-t border-gray-800">
        <div class="container mx-auto px-4 py-4">
          <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-xs text-gray-500">
            <a href="#" class="hover:text-gray-300 transition-colors">
              Conditions Générales de Vente
            </a>
            <span class="hidden sm:inline">|</span>
            <a href="#" class="hover:text-gray-300 transition-colors">
              Politique de Confidentialité
            </a>
            <span class="hidden sm:inline">|</span>
            <a href="#" class="hover:text-gray-300 transition-colors">
              Mentions Légales
            </a>
            <span class="hidden sm:inline">|</span>
            <a routerLink="/contact" class="hover:text-gray-300 transition-colors">
              Support Client
            </a>
          </div>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {
  companyInfo = environment.companyInfo;
  currentYear = new Date().getFullYear();
  newsletterEmail = '';
  isNewsletterLoading = false;

  onNewsletterSubmit(): void {
    if (!this.newsletterEmail) return;

    this.isNewsletterLoading = true;

    // Simuler l'envoi (à remplacer par un vrai service)
    setTimeout(() => {
      this.isNewsletterLoading = false;
      this.newsletterEmail = '';
      // Afficher un message de succès
      console.log('Newsletter subscription successful');
    }, 2000);
  }
}
