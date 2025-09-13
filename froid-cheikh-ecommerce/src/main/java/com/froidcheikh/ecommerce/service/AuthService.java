package com.froidcheikh.ecommerce.service;

import com.froidcheikh.ecommerce.dto.AuthDTO;
import com.froidcheikh.ecommerce.entity.Client;
import com.froidcheikh.ecommerce.entity.Administrateur;
import com.froidcheikh.ecommerce.repository.ClientRepository;
import com.froidcheikh.ecommerce.repository.AdministrateurRepository;
import com.froidcheikh.ecommerce.security.JwtTokenProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final ClientRepository clientRepository;
    private final AdministrateurRepository administrateurRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthDTO.AuthResponse login(AuthDTO.LoginRequest loginRequest) {
        log.info("🔍 Tentative de connexion pour: {}", loginRequest.getEmail());

        // DEBUT DEBUG - Vérifier si l'utilisateur existe
        Client client = clientRepository.findByEmail(loginRequest.getEmail()).orElse(null);
        Administrateur admin = administrateurRepository.findByEmail(loginRequest.getEmail()).orElse(null);

        if (client == null && admin == null) {
            log.error("❌ Aucun utilisateur trouvé avec l'email: {}", loginRequest.getEmail());
            throw new RuntimeException("Utilisateur non trouvé");
        }

        if (client != null) {
            log.info("✅ Client trouvé: {}", client.getEmail());
            log.info("🔐 Mot de passe en base: {}", client.getMotDePasse().substring(0, 10) + "...");

            // Vérifier le mot de passe
            boolean matches = passwordEncoder.matches(loginRequest.getMotDePasse(), client.getMotDePasse());
            log.info("🔑 Mot de passe valide: {}", matches);
        }

        if (admin != null) {
            log.info("✅ Admin trouvé: {}", admin.getEmail());
            log.info("🔐 Mot de passe en base: {}", admin.getMotDePasse().substring(0, 10) + "...");

            // Vérifier le mot de passe
            boolean matches = passwordEncoder.matches(loginRequest.getMotDePasse(), admin.getMotDePasse());
            log.info("🔑 Mot de passe valide: {}", matches);
        }
        // FIN DEBUG

        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(
                            loginRequest.getEmail(),
                            loginRequest.getMotDePasse()
                    )
            );

            String accessToken = tokenProvider.generateToken(authentication);
            String refreshToken = tokenProvider.generateRefreshToken(authentication);

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            AuthDTO.AuthResponse.UserInfo userInfo = getUserInfo(userDetails.getUsername());

            log.info("✅ Utilisateur connecté avec succès: {}", loginRequest.getEmail());

            return new AuthDTO.AuthResponse(
                    accessToken,
                    refreshToken,
                    "Bearer",
                    86400000L,
                    userInfo
            );
        } catch (Exception e) {
            log.error("❌ Erreur d'authentification pour {}: {}", loginRequest.getEmail(), e.getMessage());
            throw new RuntimeException("Erreur d'authentification: " + e.getMessage());
        }
    }

    public AuthDTO.AuthResponse register(AuthDTO.RegisterRequest registerRequest) {
        // Vérifier si l'email existe déjà
        if (clientRepository.existsByEmail(registerRequest.getEmail())) {
            throw new RuntimeException("Un compte avec cet email existe déjà");
        }

        // Créer le nouveau client
        Client client = new Client();
        client.setNom(registerRequest.getNom());
        client.setPrenom(registerRequest.getPrenom());
        client.setEmail(registerRequest.getEmail());
        client.setMotDePasse(passwordEncoder.encode(registerRequest.getMotDePasse()));
        client.setTelephone(registerRequest.getTelephone());
        client.setActif(true);

        client = clientRepository.save(client);

        // Authentifier automatiquement le nouveau client
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        registerRequest.getEmail(),
                        registerRequest.getMotDePasse()
                )
        );

        String accessToken = tokenProvider.generateToken(authentication);
        String refreshToken = tokenProvider.generateRefreshToken(authentication);

        AuthDTO.AuthResponse.UserInfo userInfo = new AuthDTO.AuthResponse.UserInfo(
                client.getIdClient(),
                client.getNom(),
                client.getPrenom(),
                client.getEmail(),
                "CLIENT"
        );

        log.info("Nouveau client enregistré : {}", registerRequest.getEmail());

        return new AuthDTO.AuthResponse(
                accessToken,
                refreshToken,
                "Bearer",
                86400000L,
                userInfo
        );
    }

    public AuthDTO.AuthResponse refreshToken(AuthDTO.RefreshTokenRequest refreshRequest) {
        String refreshToken = refreshRequest.getRefreshToken();

        if (!tokenProvider.validateToken(refreshToken)) {
            throw new RuntimeException("Refresh token invalide");
        }

        String username = tokenProvider.getUsernameFromToken(refreshToken);

        // Créer une nouvelle authentification
        Authentication authentication = new UsernamePasswordAuthenticationToken(
                username, null, null
        );

        String newAccessToken = tokenProvider.generateToken(authentication);
        String newRefreshToken = tokenProvider.generateRefreshToken(authentication);

        AuthDTO.AuthResponse.UserInfo userInfo = getUserInfo(username);

        return new AuthDTO.AuthResponse(
                newAccessToken,
                newRefreshToken,
                "Bearer",
                86400000L,
                userInfo
        );
    }

    private AuthDTO.AuthResponse.UserInfo getUserInfo(String email) {
        // Vérifier d'abord dans les clients
        Client client = clientRepository.findByEmail(email).orElse(null);
        if (client != null) {
            return new AuthDTO.AuthResponse.UserInfo(
                    client.getIdClient(),
                    client.getNom(),
                    client.getPrenom(),
                    client.getEmail(),
                    "CLIENT"
            );
        }

        // Vérifier ensuite dans les administrateurs
        Administrateur admin = administrateurRepository.findByEmail(email).orElse(null);
        if (admin != null) {
            return new AuthDTO.AuthResponse.UserInfo(
                    admin.getIdAdmin(),
                    admin.getNom(),
                    admin.getPrenom(),
                    admin.getEmail(),
                    admin.getRole().name()
            );
        }

        throw new RuntimeException("Utilisateur non trouvé");
    }
}