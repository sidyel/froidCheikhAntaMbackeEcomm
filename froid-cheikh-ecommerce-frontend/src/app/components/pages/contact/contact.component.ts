import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-contact',
  templateUrl: './contact.component.html',
  styleUrls: ['./contact.component.css']
})
export class ContactComponent implements OnInit {
  contactForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;

  contactInfo = {
    address: 'Dakar, Sénégal',
    phones: ['+221 77 123 45 67', '+221 70 987 65 43'],
    email: 'contact@froidcheikh.sn',
    hours: {
      weekdays: 'Lundi - Vendredi: 8h00 - 18h00',
      saturday: 'Samedi: 8h00 - 13h00',
      sunday: 'Dimanche: Fermé'
    },
    socialMedia: [
      { name: 'Facebook', url: '#', icon: 'facebook' },
      { name: 'WhatsApp', url: '#', icon: 'phone' },
      { name: 'Instagram', url: '#', icon: 'instagram' }
    ]
  };

  subjects = [
    'Demande d\'information sur un produit',
    'Demande de devis',
    'Installation et maintenance',
    'Service après-vente',
    'Réclamation',
    'Autre'
  ];

  constructor(private fb: FormBuilder) {
    this.contactForm = this.fb.group({
      nom: ['', [Validators.required, Validators.minLength(2)]],
      prenom: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      telephone: ['', [Validators.pattern(/^(\+221)?[0-9]{8,9}$/)]],
      sujet: ['', Validators.required],
      message: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {}

  get formControls() {
    return this.contactForm.controls;
  }

  onSubmit(): void {
    if (this.contactForm.valid && !this.isSubmitting) {
      this.isSubmitting = true;

      // Simulation d'envoi de formulaire
      setTimeout(() => {
        this.isSubmitting = false;
        this.submitSuccess = true;
        this.contactForm.reset();

        // Masquer le message de succès après 5 secondes
        setTimeout(() => {
          this.submitSuccess = false;
        }, 5000);
      }, 2000);
    } else {
      // Marquer tous les champs comme touchés pour afficher les erreurs
      Object.keys(this.contactForm.controls).forEach(key => {
        this.contactForm.get(key)?.markAsTouched();
      });
    }
  }

  getFieldError(fieldName: string): string {
    const field = this.contactForm.get(fieldName);
    if (field?.errors && field.touched) {
      if (field.errors['required']) {
        return 'Ce champ est obligatoire';
      }
      if (field.errors['email']) {
        return 'Format d\'email invalide';
      }
      if (field.errors['minlength']) {
        return `Minimum ${field.errors['minlength'].requiredLength} caractères`;
      }
      if (field.errors['pattern']) {
        return 'Format de téléphone invalide';
      }
    }
    return '';
  }
}
