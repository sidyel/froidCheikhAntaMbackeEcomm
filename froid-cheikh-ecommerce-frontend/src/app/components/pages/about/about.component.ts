import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-about',
  templateUrl: './about.component.html',
  styleUrls: ['./about.component.css']
})
export class AboutComponent implements OnInit {
  currentYear = new Date().getFullYear();
  imagesLoaded = false;

  companyInfo = {
    name: 'Froid Cheikh Anta Mbacké',
    foundedYear: 2015,
    description: 'Spécialiste en climatisation et réfrigération au Sénégal',
    mission: 'Fournir des solutions de climatisation et de réfrigération de qualité supérieure pour le confort de nos clients',
    vision: 'Être le leader de la climatisation au Sénégal en offrant des produits innovants et un service client exceptionnel',

    // Partenaires avec logos
    partners: [
      {
        name: 'LG Electronics',
        logo: '/assets/images/partners/lg-logo.png',
        description: 'Leader mondial en climatisation résidentielle et commerciale'
      },
      {
        name: 'Samsung',
        logo: '/assets/images/partners/samsung-logo.png',
        description: 'Innovation et technologie de pointe en climatisation'
      },
      {
        name: 'Daikin',
        logo: '/assets/images/partners/daikin-logo.png',
        description: 'Spécialiste japonais des systèmes de climatisation'
      },
      {
        name: 'Mitsubishi Electric',
        logo: '/assets/images/partners/mitsubishi-logo.png',
        description: 'Solutions de climatisation haute performance'
      },
      {
        name: 'Carrier',
        logo: '/assets/images/partners/carrier-logo.png',
        description: 'Pionnier mondial de la climatisation et réfrigération'
      },
      {
        name: 'Toshiba',
        logo: '/assets/images/partners/toshiba-logo.png',
        description: 'Technologie avancée pour le confort thermique'
      }
    ],

    // Services étendus avec descriptions détaillées
    services: [
      {
        title: 'Vente d\'Équipements',
        icon: 'shopping-cart',
        description: 'Large gamme de climatiseurs et équipements de réfrigération des meilleures marques',
        features: [
          'Climatiseurs split et multi-split',
          'Systèmes VRV/VRF',
          'Climatisation industrielle',
          'Équipements de réfrigération commerciale'
        ]
      },
      {
        title: 'Installation Professionnelle',
        icon: 'wrench',
        description: 'Installation certifiée par des techniciens qualifiés respectant les normes internationales',
        features: [
          'Étude technique préalable',
          'Installation selon normes NF',
          'Test de performance',
          'Formation à l\'utilisation'
        ]
      },
      {
        title: 'Maintenance & Réparation',
        icon: 'tool',
        description: 'Service après-vente complet pour garantir la longévité de vos équipements',
        features: [
          'Contrats de maintenance préventive',
          'Intervention d\'urgence 24h/7j',
          'Diagnostic et réparation',
          'Nettoyage et désinfection'
        ]
      },
      {
        title: 'Conseil & Étude',
        icon: 'clipboard-list',
        description: 'Accompagnement personnalisé dans le choix de vos solutions de climatisation',
        features: [
          'Audit énergétique',
          'Dimensionnement optimal',
          'Conseil en efficacité énergétique',
          'Devis gratuit et détaillé'
        ]
      },
      {
        title: 'Location d\'Équipements',
        icon: 'calendar',
        description: 'Solutions temporaires pour vos besoins ponctuels ou saisonniers',
        features: [
          'Climatiseurs mobiles',
          'Solutions événementielles',
          'Location courte et longue durée',
          'Livraison et installation incluses'
        ]
      },
      {
        title: 'Formation Technique',
        icon: 'graduation-cap',
        description: 'Formation de vos équipes techniques aux bonnes pratiques',
        features: [
          'Formation manipulation frigorigènes',
          'Maintenance préventive',
          'Sécurité et réglementation',
          'Certification professionnelle'
        ]
      }
    ],

    // Équipe avec photos et informations détaillées
    team: [
      {
        name: 'Cheikh Anta Mbacké',
        position: 'Fondateur & Directeur Général',
        experience: '15+ ans d\'expérience',
        photo: '/assets/images/team/cheikh-anta-mbacke.jpg',
        bio: 'Expert en climatisation avec une vision d\'innovation et d\'excellence. Pionnier du secteur au Sénégal.',
        skills: ['Leadership', 'Stratégie', 'Innovation', 'Développement commercial'],
        linkedin: 'https://linkedin.com/in/cheikh-anta-mbacke',
        email: 'cheikh@froidcheikh.sn'
      },
      {
        name: 'Amadou Diallo',
        position: 'Responsable Technique',
        experience: '12 ans d\'expérience',
        photo: '/assets/images/team/amadou-diallo.jpg',
        bio: 'Technicien certifié spécialisé dans les systèmes de climatisation industrielle et commerciale.',
        skills: ['Installation', 'Maintenance', 'Diagnostic', 'Formation'],
        linkedin: 'https://linkedin.com/in/amadou-diallo-tech',
        email: 'amadou@froidcheikh.sn'
      },
      {
        name: 'Fatou Ndiaye',
        position: 'Responsable Commercial',
        experience: '8 ans d\'expérience',
        photo: '/assets/images/team/fatou-ndiaye.jpg',
        bio: 'Spécialiste en solutions de climatisation avec une approche client personnalisée et efficace.',
        skills: ['Vente', 'Conseil client', 'Négociation', 'Gestion de projet'],
        linkedin: 'https://linkedin.com/in/fatou-ndiaye',
        email: 'fatou@froidcheikh.sn'
      },
      {
        name: 'Moussa Sarr',
        position: 'Technicien Senior',
        experience: '10 ans d\'expérience',
        photo: '/assets/images/team/moussa-sarr.jpg',
        bio: 'Expert en maintenance préventive et corrective, spécialisé dans les systèmes VRV/VRF.',
        skills: ['Réparation', 'Maintenance', 'Électricité', 'Frigoriste'],
        email: 'moussa@froidcheikh.sn'
      },
      {
        name: 'Aïcha Ba',
        position: 'Assistante Administrative',
        experience: '5 ans d\'expérience',
        photo: '/assets/images/team/aicha-ba.jpg',
        bio: 'Gestion administrative et support client avec un souci du détail et de la satisfaction client.',
        skills: ['Administration', 'Service client', 'Planning', 'Communication'],
        email: 'aicha@froidcheikh.sn'
      }
    ],

    // Réalisations avec photos et descriptions
    achievements: [
      {
        title: 'Centre Commercial Sea Plaza',
        category: 'Commercial',
        location: 'Dakar, Sénégal',
        image: '/assets/images/achievements/sea-plaza.jpg',
        description: 'Installation complète du système de climatisation centralisée avec unités VRF pour un confort optimal dans l\'ensemble du centre commercial.',
        surface: '5,000 m²',
        duration: '3 mois',
        year: '2023',
        tags: ['VRF', 'Commercial', 'Centralisé']
      },
      {
        title: 'Hôtel Terrou-Bi',
        category: 'Hôtellerie',
        location: 'Dakar, Sénégal',
        image: '/assets/images/achievements/terrou-bi.jpg',
        description: 'Rénovation et modernisation du système de climatisation avec installation de 200 unités split et système de gestion centralisée.',
        surface: '8,000 m²',
        duration: '4 mois',
        year: '2022',
        tags: ['Rénovation', 'Hôtellerie', 'Split', 'Gestion centralisée']
      },
      {
        title: 'Usine PATISEN',
        category: 'Industriel',
        location: 'Rufisque, Sénégal',
        image: '/assets/images/achievements/patisen.jpg',
        description: 'Installation d\'un système de réfrigération industrielle pour la conservation des produits alimentaires avec chambre froide de grande capacité.',
        surface: '2,500 m²',
        duration: '6 semaines',
        year: '2023',
        tags: ['Industriel', 'Réfrigération', 'Chambre froide', 'Alimentaire']
      },
      {
        title: 'Résidence Les Almadies',
        category: 'Résidentiel',
        location: 'Almadies, Dakar',
        image: '/assets/images/achievements/almadies.jpg',
        description: 'Climatisation complète d\'une résidence de standing avec 45 appartements équipés de systèmes split inverter haute efficacité.',
        surface: '3,200 m²',
        duration: '2 mois',
        year: '2024',
        tags: ['Résidentiel', 'Split Inverter', 'Standing', 'Efficacité énergétique']
      },
      {
        title: 'Banque Atlantique Siège',
        category: 'Bancaire',
        location: 'Plateau, Dakar',
        image: '/assets/images/achievements/banque-atlantique.jpg',
        description: 'Modernisation complète du système de climatisation du siège social avec redondance et système de monitoring avancé.',
        surface: '4,000 m²',
        duration: '3 mois',
        year: '2023',
        tags: ['Bancaire', 'Modernisation', 'Redondance', 'Monitoring']
      },
      {
        title: 'Université Cheikh Anta Diop',
        category: 'Éducation',
        location: 'Fann, Dakar',
        image: '/assets/images/achievements/ucad.jpg',
        description: 'Installation de systèmes de climatisation dans les amphithéâtres et salles de cours avec solution économe en énergie.',
        surface: '6,500 m²',
        duration: '5 mois',
        year: '2022',
        tags: ['Éducation', 'Amphithéâtre', 'Économe', 'Grande capacité']
      }
    ]
  };

  constructor() { }

  ngOnInit(): void {
    // Précharger les images critiques
    this.preloadCriticalImages();
  }

  // Précharger les images importantes
  private preloadCriticalImages(): void {
    const criticalImages = [
      '/assets/images/hero-bg-climatisation.png',
      ...this.companyInfo.team.map(member => member.photo),
      ...this.companyInfo.partners.map(partner => partner.logo),
      ...this.companyInfo.achievements.map(achievement => achievement.image)
    ];

    criticalImages.forEach(imagePath => {
      const img = new Image();
      img.onload = () => console.log(`Image préchargée: ${imagePath}`);
      img.onerror = () => console.warn(`Erreur de chargement: ${imagePath}`);
      img.src = imagePath;
    });
  }

  // Méthode pour gérer les erreurs d'images
  onImageError(event: any): void {
    console.warn('Image non trouvée:', event.target.src);
    // Remplacer par une image par défaut
    event.target.src = '/assets/images/placeholder.jpg';
  }

  // Méthode pour gérer le chargement des images
  onImageLoad(event: any): void {
    event.target.classList.add('loaded');
  }
}
