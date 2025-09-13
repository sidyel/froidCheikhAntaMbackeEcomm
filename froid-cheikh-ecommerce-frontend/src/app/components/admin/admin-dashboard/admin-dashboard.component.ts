// src/app/components/admin/dashboard/admin-dashboard.component.ts
import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { AdminService } from '../../../services/admin.service';

@Component({
  selector: 'app-admin-dashboard',
  template: `
    <div class="space-y-6">
      <!-- Header -->
      <div>
        <h1 class="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p class="text-gray-600">Vue d'ensemble de votre e-commerce</p>
      </div>

      <!-- Stats Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6" *ngIf="stats">
        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <lucide-icon name="truck" class="h-6 w-6 text-gray-400"></lucide-icon>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Commandes aujourd'hui</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.commandesDuJour }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <lucide-icon name="dollar-sign" class="h-6 w-6 text-gray-400"></lucide-icon>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Commandes ce mois</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.commandesDuMois }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <lucide-icon name="users" class="h-6 w-6 text-gray-400"></lucide-icon>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total clients</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.totalClients }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div class="bg-white overflow-hidden shadow rounded-lg">
          <div class="p-5">
            <div class="flex items-center">
              <div class="flex-shrink-0">
                <lucide-icon name="package" class="h-6 w-6 text-gray-400"></lucide-icon>
              </div>
              <div class="ml-5 w-0 flex-1">
                <dl>
                  <dt class="text-sm font-medium text-gray-500 truncate">Total produits</dt>
                  <dd class="text-lg font-medium text-gray-900">{{ stats.totalProduits }}</dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Orders & Low Stock -->
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Commandes récentes -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Commandes récentes
            </h3>
            <div class="space-y-3" *ngIf="commandesRecentes.length > 0; else noCommandes">
              <div *ngFor="let commande of commandesRecentes"
                   class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ commande.numeroCommande }}</p>
                  <p class="text-sm text-gray-500">{{ commande.dateCommande | date:'short' }}</p>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium text-gray-900">{{ commande.montantTotal | currency:'XOF':'symbol':'1.0-0' }}</p>
                  <span class="inline-flex px-2 py-1 text-xs font-medium rounded-full"
                        [ngClass]="{
                          'bg-yellow-100 text-yellow-800': commande.statutCommande === 'EN_ATTENTE',
                          'bg-blue-100 text-blue-800': commande.statutCommande === 'CONFIRMEE',
                          'bg-green-100 text-green-800': commande.statutCommande === 'PAYEE'
                        }">
                    {{ getStatutLabel(commande.statutCommande) }}
                  </span>
                </div>
              </div>
            </div>
            <ng-template #noCommandes>
              <p class="text-gray-500 text-center py-4">Aucune commande récente</p>
            </ng-template>
          </div>
        </div>

        <!-- Produits en stock faible -->
        <div class="bg-white shadow rounded-lg">
          <div class="px-4 py-5 sm:p-6">
            <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">
              Stock faible
              <span class="ml-2 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800"
                    *ngIf="produitsStockFaible.length > 0">
                {{ produitsStockFaible.length }}
              </span>
            </h3>
            <div class="space-y-3" *ngIf="produitsStockFaible.length > 0; else noStockFaible">
              <div *ngFor="let produit of produitsStockFaible"
                   class="flex items-center justify-between p-3 bg-red-50 rounded-lg">
                <div>
                  <p class="text-sm font-medium text-gray-900">{{ produit.nomProduit }}</p>
                  <p class="text-sm text-gray-500">Réf: {{ produit.refProduit }}</p>
                </div>
                <div class="text-right">
                  <span class="inline-flex px-2 py-1 text-xs font-medium bg-red-100 text-red-800 rounded-full">
                    {{ produit.stockDisponible }} restant(s)
                  </span>
                </div>
              </div>
            </div>
            <ng-template #noStockFaible>
              <p class="text-gray-500 text-center py-4">Tous les stocks sont suffisants</p>
            </ng-template>
          </div>
        </div>
      </div>

      <!-- Actions rapides -->
      <div class="bg-white shadow rounded-lg">
        <div class="px-4 py-5 sm:p-6">
          <h3 class="text-lg leading-6 font-medium text-gray-900 mb-4">Actions rapides</h3>
          <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <button routerLink="/admin/produits/nouveau"
                    class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700">
              <lucide-icon name="plus" class="mr-2 h-4 w-4"></lucide-icon>
              Nouveau produit
            </button>

            <button routerLink="/admin/categories/nouvelle"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <lucide-icon name="grid" class="mr-2 h-4 w-4"></lucide-icon>
              Nouvelle catégorie
            </button>

            <button routerLink="/admin/commandes"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <lucide-icon name="truck" class="mr-2 h-4 w-4"></lucide-icon>
              Voir commandes
            </button>

            <button routerLink="/admin/stock"
                    class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
              <lucide-icon name="warehouse" class="mr-2 h-4 w-4"></lucide-icon>
              Gérer stock
            </button>
          </div>
        </div>
      </div>
    </div>
  `
})
export class AdminDashboardComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  stats: any = null;
  commandesRecentes: any[] = [];
  produitsStockFaible: any[] = [];

  constructor(private adminService: AdminService) {}

  ngOnInit(): void {
    this.loadDashboardData();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  private loadDashboardData(): void {
    this.adminService.getDashboard()
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: (data) => {
          this.stats = data.statistiques;
          this.commandesRecentes = data.commandesRecentes || [];
          this.produitsStockFaible = data.produitsStockFaible || [];
        },
        error: (error) => {
          console.error('Erreur lors du chargement du dashboard:', error);
        }
      });
  }

  getStatutLabel(statut: string): string {
    const labels: { [key: string]: string } = {
      'EN_ATTENTE': 'En attente',
      'CONFIRMEE': 'Confirmée',
      'PAYEE': 'Payée',
      'EN_PREPARATION': 'En préparation',
      'EXPEDIE': 'Expédiée',
      'LIVREE': 'Livrée',
      'ANNULEE': 'Annulée'
    };
    return labels[statut] || statut;
  }
}
