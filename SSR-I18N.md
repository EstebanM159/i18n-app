# Angular SSR con idiomas y cookie

Esta guía explica la configuración usada en este proyecto para que Angular SSR renderice directamente el idioma guardado en una cookie y no muestre un idioma temporal antes de cambiar al correcto.

## El problema

La aplicación tenía esta secuencia:

1. `ngx-translate` iniciaba en español.
2. `App` leía la cookie después de arrancar.
3. `translate.use('fr')` o `translate.use('it')` cargaba el JSON de forma asíncrona.
4. El usuario veía primero español y después el idioma de la cookie.

Ese cambio visible es el llamado *flash* de idioma.

También apareció un error durante SSR:

```text
Failed to load http://localhost/i18n/es.json
ECONNREFUSED
```

El servidor escuchaba en el puerto `4000`, pero el loader intentaba cargar las traducciones desde el puerto HTTP predeterminado (`80`).

## Estructura recomendada

```text
public/
  i18n/
    en.json
    es.json
    fr.json
    it.json

src/app/
  app.config.ts
  app.config.server.ts
  service/
    language.service.ts
```

Los archivos dentro de `public` se sirven como recursos estáticos. Por ejemplo:

```text
public/i18n/fr.json
```

se solicita desde:

```text
/i18n/fr.json
```

## Dependencias

Instala las dependencias necesarias:

```bash
npm install @ngx-translate/core @ngx-translate/http-loader ngx-cookie-service-ssr
```

Para SSR también deben estar configurados los paquetes de Angular SSR:

```bash
npm install @angular/ssr
```

## Configuración del traductor

En `src/app/app.config.ts`:

```typescript
import {
  APP_INITIALIZER,
  ApplicationConfig,
  inject,
  provideBrowserGlobalErrorListeners,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import {
  provideTranslateService,
  TranslateService,
} from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';
import { provideClientHydration } from '@angular/platform-browser';
import { SsrCookieService } from 'ngx-cookie-service-ssr';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideClientHydration(),
    provideTranslateService({
      fallbackLang: 'es',
      loader: provideTranslateHttpLoader({
        prefix: 'http://localhost:4000/i18n/',
        failOnError: true,
      }),
    }),
    {
      provide: APP_INITIALIZER,
      multi: true,
      useFactory: () => {
        const cookie = inject(SsrCookieService);
        const translate = inject(TranslateService);

        return () => {
          const lang = cookie.check('lang')
            ? cookie.get('lang')
            : 'es';

          return translate.use(lang);
        };
      },
    },
    SsrCookieService,
  ],
};
```

### Qué hace cada parte

- `fallbackLang: 'es'`: idioma de respaldo si una traducción no existe.
- `provideTranslateHttpLoader(...)`: carga los JSON desde `public/i18n`.
- `SsrCookieService`: permite leer la cookie tanto en el servidor como en el navegador.
- `APP_INITIALIZER`: ejecuta código antes de que Angular termine de arrancar.
- `translate.use(lang)`: devuelve un `Observable`; Angular espera a que el JSON termine de cargar.
- Al esperar esa carga, el HTML inicial ya se renderiza en el idioma correcto.

No debe configurarse simultáneamente `lang: 'es'` y luego cambiar el idioma en el constructor de `App`. Eso vuelve a introducir el parpadeo.

## Componente raíz

`src/app/app.ts` debe quedarse sin lógica de cambio de idioma:

```typescript
import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly title = signal('i18n-app');
}
```

La elección inicial del idioma pertenece al inicializador de configuración, no al constructor del componente raíz.

## Servicio para cambiar el idioma

El cambio realizado por el usuario sí ocurre en el servicio:

```typescript
import { inject, Service } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { SsrCookieService } from 'ngx-cookie-service-ssr';

@Service()
export class LanguageService {
  cookie = inject(SsrCookieService);
  translate = inject(TranslateService);

  changeLanguage(lang: string) {
    this.cookie.set('lang', lang);
    this.translate.use(lang);
  }
}
```

La cookie se escribe al seleccionar un idioma. En la siguiente petición SSR, `APP_INITIALIZER` la leerá antes de renderizar.

## Selector de idioma

El valor visual del selector debe ser reactivo. Leer la cookie directamente en la plantilla no garantiza que Angular actualice la vista después de cambiarla.

```typescript
currentLanguage = signal(
  this.languageService.cookie.get('lang') || 'es',
);

changeLanguage(event: Event) {
  const target = event.target as HTMLSelectElement;
  const lang = target.value;

  this.currentLanguage.set(lang);
  this.languageService.changeLanguage(lang);
}
```

En la plantilla:

```html
<select
  [value]="currentLanguage()"
  (change)="changeLanguage($event)"
>
  @for (language of languages(); track language.code) {
    <option [value]="language.code">
      {{ language.flag }}
    </option>
  }
</select>
```

No se debe usar `defaultSelected` con el valor de la cookie en todas las opciones. `defaultSelected` es un atributo inicial de cada `option`; no es una comparación entre el código de la opción y el idioma guardado.

## Configuración SSR

`src/app/app.config.server.ts` combina la configuración común con el renderizado del servidor:

```typescript
import { mergeApplicationConfig, ApplicationConfig } from '@angular/core';
import { provideServerRendering, withRoutes } from '@angular/ssr';
import { appConfig } from './app.config';
import { serverRoutes } from './app.routes.server';

const serverConfig: ApplicationConfig = {
  providers: [
    provideServerRendering(withRoutes(serverRoutes)),
  ],
};

export const config = mergeApplicationConfig(appConfig, serverConfig);
```

El servidor Express debe servir la carpeta browser generada y delegar las demás peticiones a Angular SSR. El puerto usado en este proyecto es `4000`.

## Scripts

En `package.json`:

```json
{
  "scripts": {
    "build": "ng build",
    "serve:ssr:i18n-app": "node dist/i18n-app/server/server.mjs"
  }
}
```

Flujo de ejecución:

```bash
npm run build
npm run serve:ssr:i18n-app
```

En Windows PowerShell, si `npm` es bloqueado por la política de ejecución de scripts, usa:

```bash
npm.cmd run build
npm.cmd run serve:ssr:i18n-app
```

Después abre:

```text
http://localhost:4000
```

## Importante para producción

La URL usada en este proyecto:

```typescript
prefix: 'http://localhost:4000/i18n/'
```

resuelve el problema del SSR local porque Node necesita una URL absoluta y el servidor está escuchando en `4000`. No conviene dejarla fija en producción.

En producción, el origen debe configurarse según el dominio real o mediante una configuración específica de entorno. Por ejemplo:

```typescript
const translationOrigin = 'https://mi-dominio.com';

provideTranslateHttpLoader({
  prefix: `${translationOrigin}/i18n/`,
});
```

El valor debe coincidir con el host y puerto donde realmente se sirve la aplicación.

## Comprobación del problema

Si aparece un error como este:

```text
ECONNREFUSED
http://localhost/i18n/es.json
```

comprueba:

1. Que el servidor SSR esté ejecutándose.
2. Que el puerto del `prefix` coincida con el puerto de Express.
3. Que exista el archivo correspondiente en `public/i18n`.
4. Que el recurso esté disponible en el navegador, por ejemplo `http://localhost:4000/i18n/es.json`.
5. Que hayas ejecutado `npm run build` antes de arrancar el servidor SSR.

Si el texto aparece primero en español y luego cambia, normalmente significa que el idioma se está seleccionando en un componente o constructor después del arranque. La selección inicial debe permanecer dentro de `APP_INITIALIZER`.
