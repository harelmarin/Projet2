# Projet2

Application de gestion d'étudiants : back-end Spring Boot (Java 21, MySQL, JWT) et front-end Angular 19.

## Prérequis

- JDK 21
- Docker Desktop démarré
- Node.js et npm

## Lancer le back-end

```bash
cd Back-end---Testez-et-am-liorez-une-application-existante
JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn spring-boot:run
```

Spring Boot démarre automatiquement le conteneur MySQL (`compose.yaml`) et lit les variables du fichier `.env`.
L'API écoute sur http://localhost:8080.

## Lancer le front-end

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm install
npm start
```

L'application est disponible sur http://localhost:4200.

## Utiliser l'application

1. Créer un compte depuis la page d'inscription.
2. Se connecter : un token JWT est renvoyé et stocké dans le navigateur.
3. Gérer les étudiants (liste, ajout, détail, modification, suppression).

## Lancer les tests du back-end

Docker doit être démarré (les tests d'intégration utilisent un conteneur MySQL via Testcontainers).

```bash
cd Back-end---Testez-et-am-liorez-une-application-existante
JAVA_HOME=$(/usr/libexec/java_home -v 21) mvn clean test
```

Le rapport de couverture JaCoCo est généré dans `target/site/jacoco/index.html`.
Couverture actuelle : 83 %.

## Lancer les tests du front-end

```bash
cd Front-end---Testez-et-am-liorez-une-application-existante
npm test
```
