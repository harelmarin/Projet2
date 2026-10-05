# Notes — Étape 1 : exploration des starters code

> Brouillon à compléter avec mes propres mots. Aucun code modifié à cette étape.

## 1. Comment ça marche

Flux d'une inscription :

```
Formulaire Angular (RegisterComponent)
  → UserService (front)            POST /api/register
  → proxy Angular (4200 → 8080)    proxy.conf.json
  → UserController
  → UserDtoMapper                  RegisterDTO → User (MapStruct)
  → UserService.register           vérifie le login, hache le mot de passe (BCrypt)
  → UserRepository.save            Spring Data JPA
  → MySQL (Docker)                 table `user`
```

Rôle des couches (back, package `com.openclassrooms.etudiant`) :

- **controller** : reçoit les requêtes HTTP (`/api/register`, `/api/login`).
- **dto** : objets échangés avec l'extérieur (on n'expose pas l'entité).
- **mapper** : convertit DTO ↔ entité.
- **service** : logique métier (`UserService`, `JwtService`).
- **repository** : accès base de données.
- **entities** : `User` (implémente `UserDetails` de Spring Security).
- **configuration** : sécurité (stateless, BCrypt), logging des requêtes.
- **handler** : `RestExceptionHandler`, transforme les exceptions en réponses d'erreur.

Config : `application.yml` (variables `DB_*` issues du `.env`), `compose.yaml` (conteneur MySQL démarré automatiquement par Spring Boot via `spring-boot-docker-compose`).

## 2. Ce qui fonctionne (vérifié)

- Back démarré depuis IntelliJ (JDK 21), MySQL en conteneur, `Started ... in 2.52 seconds`.
- Front démarré (`npm run start` / `npx ng serve`).
- Inscription via le front (`/register`) OK et via `curl` OK (`201`).
- Logs back : `Registering new user` → `select ... where login=?` → `insert into user ...`.
- Table `user` vérifiée dans MySQL : mot de passe stocké haché (`$2a$10$...`, BCrypt).

## 3. Points à creuser

Par priorité :

1. **`UserService.login`** : `passwordEncoder.matches(password, password)` compare le mot de passe avec lui-même au lieu du hash en base → tout mot de passe passe.
2. **`JwtService.generateToken`** renvoie `null` (TODO) ; aucune dépendance JWT dans le `pom.xml`.
3. **`UserController.login`** : pas de `@RequestBody`, le JSON ne sera pas lu.
4. **`SpringSecurityConfig`** : filtre d'authentification JWT commenté ; CORS désactivé.
5. **Gestion d'erreurs** : que renvoie `RestExceptionHandler` pour un login déjà pris (400 attendu par les tests) ?
6. **Front** : pas de gestion d'erreur dans le `subscribe` du formulaire ; pas de page de login ; redirection après inscription en TODO.
7. **Fonctionnalités annoncées « à faire »** dans le README du back : authentification, CRUD des étudiants (aucune entité ni contrôleur pour les étudiants).
8. **`RestExceptionHandler`** (gestionnaire global d'exceptions, `@RestControllerAdvice`) :
   - L'`AccessDeniedException` importée est `java.nio.file.AccessDeniedException` (système de fichiers), pas celle de Spring Security (`org.springframework.security.access`) → le handler 403 ne se déclenche jamais pour un refus d'accès Spring.
   - `handleException(RuntimeException ...)` est déclaré pour `@ExceptionHandler(Exception.class)` : le paramètre est plus étroit que l'exception capturée, à vérifier pour les exceptions « checked ».
   - Un login incorrect lève `IllegalArgumentException` → **400** ; `BadCredentialsException` (déjà géré en **401**) serait plus adapté.
9. **Logs** : `RequestLoggingFilterConfig` active `CommonsRequestLoggingFilter` avec `includePayload(true)`, mais il ne logue qu'en DEBUG et `application.yml` le règle sur `info` → rien n'est affiché. Passer en `debug` afficherait le corps des requêtes, mots de passe en clair compris.
10. **Détails** : colonnes `first_name`/`last_name` (conversion camelCase → snake_case) alors que l'entité déclare `firstName`/`lastName` ; champs `created_at`/`updated_at` en snake_case dans l'entité.

## 4. Tests : état et lacunes

Back :
- `UserServiceTest` (unitaire, Mockito) : 3/3 passent (register null, login existant, création).
- `UserControllerTest` (intégration, MockMvc + Testcontainers MySQL) : **bloqué** — Docker Desktop 29 (API min 1.44) rejette Testcontainers 1.20.0 (`Could not find a valid Docker environment`).
- Aucun test de `login`, de `JwtService`, du mapper, de la sécurité.
- Pas de JaCoCo (pas de mesure de couverture).
- Style des tests : Given / When / Then, constantes en haut de classe.

Front (Jest) :
- 4/4 passent, mais très superficiels (« le composant se crée », titre de l'app).
- Dans `register.component.spec.ts`, `useValue: UserMockService` fournit la classe, pas une instance.
- `UserMockService.register` renvoie `of()` (n'émet jamais) : la branche « succès » est impossible à tester.
- Couverture déjà activée (`collectCoverage: true`, rapport HTML).

## 5. Problèmes rencontrés et solutions

| Problème | Cause | Solution |
|---|---|---|
| IntelliJ : `ExceptionInInitializerError` au build | SDK du projet = JDK 25, incompatible avec Lombok 1.18.32 | SDK du projet sur JDK 21 (temurin-21) |
| `No Docker Compose file found in directory '.../Projet2/.'` | Dossier de travail de la config Run = racine `Projet2/` | Working directory = dossier du back |
| Page `localhost:55000` : `ERR_INVALID_HTTP_RESPONSE` | Clic sur le lien du port : MySQL n'est pas un serveur HTTP | Cliquer sur le nom du conteneur `mysql-1` → onglet Exec |
| `Access denied for user 'etudiant_db'` | Commande tapée avec `-p,` (virgule = mot de passe) | `mysql -u etudiant_db -p` puis saisir le mot de passe |
| `delete * from user` : erreur de syntaxe | `*` n'existe pas dans `DELETE` | `delete from user where ...;` |
| `ng: command not found` | Angular CLI pas installé globalement | `npx ng serve` ou `npm run start` |

## 5 bis. Journal des corrections (étape 2 : API d'authentification) — pour la soutenance

Méthode : reproduire le bug (Bruno, `POST /api/login`), lire la trace, corriger **un bug à la fois**, rejouer la requête, un commit par correction.

### Correction 1 — `@RequestBody` manquant dans `UserController.login`
- **Avant** : `login(LoginRequestDTO loginRequestDTO)`. Requête Bruno `{"login":"test","password":"azerty"}` → **400**. Trace : `IllegalArgumentException: Login must not be null` (`UserService.login`, ligne 37, appelé par `UserController.login`, ligne 32).
- **Cause** : sans `@RequestBody`, Spring ne lit pas le JSON ; le DTO reste vide (`getLogin()` = `null`). `register`, lui, avait bien `@Valid @RequestBody`.
- **Après** : `login(@Valid @RequestBody LoginRequestDTO loginRequestDTO)`.
- **À vérifier / reste à faire** : `@Valid` n'a **aucun effet** tant que `LoginRequestDTO` n'a pas de `@NotBlank` sur `login` et `password` (l'import existe mais n'est pas utilisé). Sans ça, un JSON vide `{}` passe encore la validation.

### Correction 2 — mot de passe comparé à lui-même dans `UserService.login`
- **Avant** : `passwordEncoder.matches(password, password)` → compare le mot de passe saisi avec lui-même, jamais avec le hash stocké en base ; la vérification n'avait aucun sens.
- **Après** : `passwordEncoder.matches(password, user.get().getPassword())` → comparaison avec le hash BCrypt de la base (BCrypt ne se « déhashe » pas : on vérifie avec `matches(saisi, hash)`).

### Correction 3 — `UserDetails` construit sans mot de passe
- **Avant** : `org.springframework.security.core.userdetails.User.builder().username(login).build()` → le `build()` de Spring Security refuse un mot de passe `null` (`IllegalArgumentException`). De plus, le nom de classe complet était nécessaire à cause du conflit avec l'entité `User`.
- **Après** : `jwtService.generateToken(user.get())` → l'entité `User` implémente déjà `UserDetails`, on passe directement l'utilisateur trouvé en base.
- **Reste** : l'import `UserDetails` est devenu inutilisé dans `UserService` (à supprimer).

### Changement de configuration temporaire — logs du filtre de requêtes
- `application.yml` : `CommonsRequestLoggingFilter` passé de `info` à `debug` pour voir le corps des requêtes.
- ⚠️ **À remettre en `info` avant le rendu** : en `debug`, les mots de passe envoyés à `/api/register` et `/api/login` apparaissent en clair dans les logs.

### À faire ensuite (bugs encore masqués par le premier)
- [x] `UserService.login` : `matches(password, password)` → comparer avec le hash en base (correction 2).
- [x] `UserService.login` : `User.builder()...build()` sans mot de passe → utiliser l'utilisateur de la base (correction 3).
- [ ] Supprimer l'import `UserDetails` inutilisé dans `UserService`.
- [ ] Ajouter `@NotBlank` sur `login` et `password` dans `LoginRequestDTO` (sinon `@Valid` ne valide rien).
- [ ] Mauvais identifiants : lever `BadCredentialsException` (401) au lieu d'`IllegalArgumentException` (400).
- [ ] `JwtService.generateToken` : ajouter une dépendance JWT, clé secrète et durée en configuration.
- [ ] Tests : `login` dans `UserServiceTest` (succès, mauvais mot de passe, utilisateur inconnu) ; test du contrôleur (nécessite de résoudre Docker 29 / Testcontainers).
- [ ] Capture Bruno avant / après (400 → 200 + token).

## 6. Questions ouvertes

- À compléter : ce que je ne comprends pas encore (annotation processors Lombok/MapStruct, rôle exact de `spring-boot-docker-compose`, fonctionnement du proxy Angular, etc.).

## 7. Dépôts git

- Back et front sont deux dépôts séparés, clonés depuis `OpenClassrooms-Student-Center` (pas de droit de push). Commits en local, rendu en zip.
- `Projet2/` n'est pas un dépôt git (on garde un dépôt par projet).
