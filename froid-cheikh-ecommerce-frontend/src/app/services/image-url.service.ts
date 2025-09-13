import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ImageUrlService {
  private baseUrl = 'http://localhost:8080';

  /**
   * Construit l'URL complète d'une image
   */
  getImageUrl(imagePath: string | null | undefined): string {
    if (!imagePath) {
      return '/assets/images/placeholder.jpg';
    }

    // Si c'est déjà une URL complète
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }

    // Construire l'URL complète
    const fullUrl = `${this.baseUrl}/uploads/${imagePath}`;
    console.log('🔗 URL construite:', fullUrl);
    return fullUrl;
  }

  /**
   * Teste si une image est accessible
   */
  async checkImageExists(imagePath: string): Promise<boolean> {
    try {
      const url = this.getImageUrl(imagePath);
      const response = await fetch(url, { method: 'HEAD' });
      const exists = response.ok;
      console.log('🔍 Image existe:', exists, 'pour:', url);
      return exists;
    } catch (error) {
      console.error('❌ Erreur lors du test d\'existence:', error);
      return false;
    }
  }
}
