# Projet2

Application de gestion d'étudiants : back-end Spring Boot (Java 21, MySQL, JWT) et front-end Angular 19.

## Prérequis

- JDK 21 (Java 21 actif dans le terminal)
- Docker Desktop démarré
- Node.js 20 ou plus, et npm

## Lancer le back-end

```bash
cd Back-end---Testez-et-am-liorez-une-application-existante
./mvnw spring-boot:run          # Windows : mvnw.cmd spring-boot:run
```

Spring Boot démarre automatiquement le conteneur MySQL (`compose.yaml`) et lit les variables du fichier `.env` (identifiants de la base et secret JWT de développement).
L'API écoute sur http://localhost:8080.

## Lancer le front-end

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm install
npm start
```

L'application est disponible sur http://localhost:4200.

## Utiliser l'application

| Page | Adresse |
|---|---|
| Inscription | http://localhost:4200/register |
| Connexion | http://localhost:4200/login |
| Liste des étudiants | http://localhost:4200/students |

1. Créer un compte sur la page d'inscription.
2. Se connecter : un token JWT est renvoyé et stocké dans le navigateur.
3. Gérer les étudiants (liste, ajout, détail, modification, suppression).

## Lancer les tests du back-end

Docker doit être démarré (les tests d'intégration utilisent un conteneur MySQL via Testcontainers).

```bash
cd Back-end---Testez-et-am-liorez-une-application-existante
./mvnw clean test          # Windows : mvnw.cmd clean test
```

Le rapport de couverture JaCoCo est généré dans `target/site/jacoco/index.html`.
Couverture actuelle : 83 %.

## Lancer les tests du front-end

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm test
```

Le rapport de couverture est généré dans `coverage/index.html`.
Couverture actuelle : 94 %.

## Lancer les tests E2E (Cypress)

Les appels à l'API sont simulés : le back n'a pas besoin d'être démarré.

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm start
```

Puis, dans un second terminal :

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm run e2e
```
