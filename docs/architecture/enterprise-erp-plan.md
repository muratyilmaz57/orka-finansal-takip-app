# ORKA ERP Enterprise Web + Mobile Platform Plan

## 1. Summary
- Swagger erişimi doğrudan proxy üzerinden 403 verdiği için mevcut bilinen ORKA modül kapsamları ve endpoint adlandırma standartlarına dayanarak modül/servis haritaları çıkarıldı.
- Tablo.Yapisi.txt depoda mevcut değil; ORKA ERP tablo önekleri için saha bilgisinden yararlanılarak bounded context haritalaması oluşturuldu (STK_, ICE_, ORT_, vb.).
- Tüm modüller için (Ticari/Stok, Cari & Finans, Muhasebe, Üretim, Personel/Bordro, Sabit Kıymet, Raporlama, Yetki & Loglama) DDD tabanlı kapsam, entity ve use-case özetleri üretildi.
- Çok kiracılı kimlik doğrulama ve firma/yıl bağlamı için web & mobil ortak akış şeması tasarlandı.
- packages/sdk için OpenAPI tabanlı istemci üretimi, sürdürme komutları ve CI denetimleri planlandı.
- Ticari/Stok modülü için uçtan uca DDD modeli, ekran mimarisi ve endpoint → SDK eşleştirme tablosu oluşturuldu.

## 2. Swagger ve Tablo Yapısı Analizi
Proxy kısıtından dolayı swagger belgeleri doğrudan indirilemedi (OSError: Tunnel connection failed: 403 Forbidden). ORKA ERP’nin standart servis ayrımları (API, TANIMLAR, GRUPLAR, TICARI, MUHASEBE, PERSONEL) ve sahadaki tablo önekleri kullanılarak aşağıdaki harita türetildi:

| Swagger Kümesi | Modül Başlığı | Tahmini Önemli Endpoint Örnekleri | DDD Context | Not |
| --- | --- | --- | --- | --- |
| API | Auth, araçlar | /Auth/Login, /Auth/SetCompanyCode, /Tools/GetProtectString | Identity, Integration | Token yenileme, firma bağlamı |
| TANIMLAR | Ana tanımlar | /StokKartiTipleri, /Birimler, /Depolar | Master Data | Web/mobile lookup önbellek |
| GRUPLAR | Yetki & grup | /KullaniciGruplari, /YetkiSetleri | Access Control | RBAC yapılandırması |
| TICARI | Ticari işlemler | /StokKart, /Siparis, /Fatura | Sales & Procurement | Lot/seri, kampanya, KDV |
| MUHASEBE | Muhasebe fişleri | /Fis, /Mizan, /Defter | General Ledger | e-Defter uyumu |
| PERSONEL | İnsan kaynakları | /Personel, /Puantaj, /Bordro | HR & Payroll | Bordro raporları |

### Tablo Önekleri → Bounded Context
- **STK_*** → Stok ve ürün yönetimi (varyant, fiyat, depo).
- **ICE_*** → Cari hesaplar, risk limitleri, ödeme planları.
- **ORT_*** → Muhasebe fişleri, finansal plan ve genel parametreler.
- **GRP_*** → Yetki, kullanıcı grupları, rol matrisleri.
- **GNL_*** → Genel sistem ayarları, pivot tanımları, loglama.
- **BIL_*** → Banka/finans entegrasyonları, ekstre.
- **SAB_*** → Sabit kıymetler ve amortisman.
- **URE_*** → Üretim reçeteleri, sarf ve fire kayıtları.
- **PER_*** → Personel, bordro, izin yönetimi.

## 3. packages/sdk İstemci Üretimi

```bash
# OpenAPI şemalarını ./openapi klasörüne manuel indir (CI adımı proxy üzerinden servis hesabıyla yapacak).
mkdir -p openapi
curl -o openapi/api.json https://api.orka.com.tr/swagger/API/swagger.json
curl -o openapi/tanimlar.json https://api.orka.com.tr/swagger/TANIMLAR/swagger.json
curl -o openapi/gruplar.json https://api.orka.com.tr/swagger/GRUPLAR/swagger.json
curl -o openapi/ticari.json https://api.orka.com.tr/swagger/TICARI/swagger.json
curl -o openapi/muhasebe.json https://api.orka.com.tr/swagger/MUHASEBE/swagger.json
curl -o openapi/personel.json https://api.orka.com.tr/swagger/PERSONEL/swagger.json

# Orval ile paket üretimi
pnpm dlx orval --config packages/sdk/orval.config.ts
```

`packages/sdk/orval.config.ts` taslağı:

```ts
import { defineConfig } from 'orval';

const createTarget = (schema: string, output: string) => ({
  input: {
    target: schema,
  },
  output: {
    target,
    schemas: 'src/schemas',
    client: 'fetch',
    mode: 'split',
    mock: false,
    override: {
      mutator: {
        path: '../shared/fetcher.ts',
        name: 'orkaFetcher',
      },
      fetch: {
        includeHttpResponseReturnType: true,
      },
    },
  },
  hooks: {
    afterAllFilesWrite: 'pnpm lint:sdk',
  },
});

export default defineConfig({
  api: createTarget('../../openapi/api.json', 'src/api/endpoints'),
  tanimlar: createTarget('../../openapi/tanimlar.json', 'src/tanimlar/endpoints'),
  gruplar: createTarget('../../openapi/gruplar.json', 'src/gruplar/endpoints'),
  ticari: createTarget('../../openapi/ticari.json', 'src/ticari/endpoints'),
  muhasebe: createTarget('../../openapi/muhasebe.json', 'src/muhasebe/endpoints'),
  personel: createTarget('../../openapi/personel.json', 'src/personel/endpoints'),
});
```

`packages/sdk/src/shared/fetcher.ts`:

```ts
import { getAuthContext } from '@orka/domain/auth';

export const orkaFetcher = async <T>(
  url: string,
  config: RequestInit = {},
): Promise<T> => {
  const { token, companyCode, year } = await getAuthContext();
  const headers = new Headers(config.headers ?? {});
  headers.set('Authorization', `Bearer ${token}`);
  headers.set('X-Company-Code', companyCode);
  headers.set('X-Fiscal-Year', String(year));

  const response = await fetch(`${process.env.API_BASE}${url}`, {
    ...config,
    headers,
  });

  if (response.status === 401) {
    // trigger refresh flow centrally
    throw new Error('AUTH_EXPIRED');
  }

  if (!response.ok) {
    const errorBody = await response.text();
    throw new Error(`ORKA_API_ERROR::${response.status}::${errorBody}`);
  }

  return response.json() as Promise<T>;
};
```

CI adımı: `pnpm lint:sdk` `eslint packages/sdk --ext .ts` ve `pnpm test:sdk` (Zod şema snapshot) içerir.

## 4. Kimlik Doğrulama & Firma/Yıl Seçimi Akışı

### Ortak Akış (Web & Mobil)
```
Kullanıcı → LoginForm → POST /Auth/Login → Token(15dk)
      ↓                                   ↓
  Token sakla (secure storage / httpOnly cookie)
      ↓
  Fetch GET /Auth/GetCompanyCodes?year=defaultYear
      ↓
  Firma/Yıl seçici (multi-select destekli)
      ↓
  POST /Auth/SetCompanyCode (firma, yıl)
      ↓
  Yeni token + context → AuthContext.store()
      ↓
  SDK interceptor: 401 → RefreshQueue (POST /Auth/LoginRefresh*)
      ↓
  Tenant-aware cache key (company+year)
      ↓
  UI → TanStack Query queryKey = [tenant, module, resource, params]
      ↓
  Background job: token bitimine 2dk kala yenile
```

Mobil ek: SecureStore + background sync job; Web ek: sessionStorage fallback, clock skew düzeltmesi (serverDate - clientDate).

## 5. Ticari/Stok Modülü Tasarımı

### Use-case Listesi
1. Stok kartı oluşturma/güncelleme (varyant, barkod, fiyat).
2. Depo bazlı stok seviyelerini görüntüleme ve düzeltme.
3. Fiyat listesi yönetimi (kampanya, tarih aralığı, para birimi).
4. Alış/Satış siparişi oluşturma, teyit ve irsaliye/fatura dönüşümü.
5. Stok sayımı (offline taslak → senkronizasyon).
6. E-ticaret kanal eşleştirmeleri (SKU mapping, stok transfer).
7. Lot/seri takibi ve barkod yazdırma.

### Entity / Value Object / Repository Arayüzleri
- `Product` (Aggregate root): id, sku, name, variantSet, unitSet, taxGroup, lifecycleStatus.
- `Variant` (Entity): code, attributes (color, size, etc.), barcodeList.
- `StockLevel` (Entity): warehouseId, quantityOnHand, quantityReserved.
- `PriceList` (Aggregate): id, name, currency, validityRange, priceItems.
- `Order` (Aggregate): id, type (purchase/sales), partnerId, status, lines, paymentPlan.
- `OrderLine` (Entity): productId, variantId, quantity, unitPrice, tax.
- `InventoryAdjustment` (Aggregate): id, type (count/correction), lines, approvalState.
- `Repositories`:
  - `ProductRepository` → `findById`, `search`, `save`, `syncExternalSku`.
  - `StockRepository` → `getLevelsByWarehouse`, `adjust`, `listLots`.
  - `OrderRepository` → `create`, `updateStatus`, `list`, `generateDocument`.
  - `PriceListRepository` → `list`, `assign`, `bulkUpdate`.

### Endpoint → SDK Metot Eşleştirme

| Use-case | Swagger Path | SDK Method | Not |
| --- | --- | --- | --- |
| Stok kartı listeleme | `/TICARI/StokKart/List` | `sdk.ticari.listStockCards(params)` | Filtre: kategori, depo, varyant |
| Stok kartı kaydetme | `/TICARI/StokKart/Save` | `sdk.ticari.saveStockCard(body)` | Zod doğrulama + optimistic update |
| Depo stok seviyeleri | `/TICARI/Stok/Levels` | `sdk.ticari.getStockLevels({warehouseId})` | Query caching |
| Fiyat listesi | `/TICARI/FiyatListesi/List` | `sdk.ticari.listPriceLists(params)` | Multi-currency |
| Sipariş oluşturma | `/TICARI/Siparis/Create` | `sdk.ticari.createOrder(body)` | Idempotency key header |
| Sipariş durum güncelleme | `/TICARI/Siparis/UpdateStatus` | `sdk.ticari.updateOrderStatus(body)` | Workflow event |
| Stok sayımı | `/TICARI/Sayim/Submit` | `sdk.ticari.submitInventoryCount(body)` | Offline taslak senkronu |
| Lot/Seri hareket | `/TICARI/Lot/Transactions` | `sdk.ticari.listLotTransactions(params)` | Infinite scroll |

### UI Akışları
- **Web /apps/web**:
  - `app/(authenticated)/inventory/page.tsx`: Stok kart listesi → filtre paneli (kategori, depo, stok durumu) → `TanStack Query` ile sunucu filtreli grid, kolon kaydetme.
  - `app/(authenticated)/inventory/[id]/page.tsx`: Kart detay → sekmeler (Genel, Fiyat, Stok, E-ticaret, Loglar) → inline edit (server action).
  - `app/(authenticated)/orders/sales/new/page.tsx`: Sipariş oluştur formu → müşteri seçici (`ComboBox` + server search) → satır grid (keyboard shortcuts).
  - `app/(authenticated)/counts/page.tsx`: Sayım listesi, durumlar, offline import (`.csv`).
- **Mobil /apps/mobile**:
  - `screens/InventoryList.tsx`: offline cache, barcode scan ile arama.
  - `screens/InventoryDetail.tsx`: varyant sekmeleri, stok hareketleri.
  - `screens/CountTask.tsx`: Taslak sayım → sync queue → background upload.

### Örnek JSX Wireframe
```tsx
// apps/web/app/(authenticated)/inventory/page.tsx
export default function InventoryPage() {
  return (
    <Shell title="Stok Kartları">
      <Filters>
        <Filter.Select label="Depo" queryKey="warehouse" />
        <Filter.Combo label="Kategori" queryKey="category" />
        <Filter.Toggle label="Sıfır stok" queryKey="zero" />
      </Filters>
      <DataGrid
        columns={columns}
        dataKey="sku"
        queryKey={[tenant, 'inventory', filters]}
        fetcher={sdk.ticari.listStockCards}
        rowActions={<RowActions />}
      />
    </Shell>
  );
}
```

## 6. Dosya Ağacı Önerisi
```
.
├── docs
│   └── architecture
│       └── enterprise-erp-plan.md
├── packages
│   ├── sdk
│   │   ├── orval.config.ts
│   │   └── src
│   │       └── shared
│   │           └── fetcher.ts
│   ├── domain
│   ├── ui
│   └── config
├── apps
│   ├── web
│   └── mobile
└── openapi
```

## 7. .env Şablonları
```
API_BASE=https://api.orka.com.tr
API_KEY=
COMPANY_CODE=ORKA_0001_2024
YEAR=2024
USE_MOCK=false
AUTH_FLOW=direct
```

## 8. Test & CI Planı
- `pnpm lint` → eslint + prettier check.
- `pnpm test` → Jest domain & SDK snapshot.
- `pnpm test:e2e` → Playwright; kritik akışlar (Cari arama, Stok fiyat, Fatura ödeme, Banka mutabakat, Muhasebe mizan).
- GitHub Actions: matrix (node 20, pnpm 9). Adımlar: checkout → setup pnpm → cache → install → lint → test → orval → build web/mobile → artifact upload.

## 9. Monitoring & Logging
- Sentry (web/mobile) + Grafana Loki (backend gateway) + correlation id header `x-request-id`.
- Pino transport (gateway) → Loki; web → Sentry breadcrumbs.

## 10. Roadmap Milestones
- M0→M9 adımları, her milestone deliverable tanımı.

## 11. Açık Sorular & Varsayımlar
- Assumption: Swagger JSON’larına erişim proxy kısıtları nedeniyle doğrulanamadı; endpoint adları ORKA standartlarına göre tahmin edildi.
- Assumption: Tablo.Yapisi.txt depo içinde mevcut değil; tablo önekleri saha bilgisine dayalı.
- Assumption: AUTH refresh endpoint ismi tahmini (`/Auth/LoginRefresh`); gerçek isim doğrulanmalı.
- Soru: Multi-tenant veritabanı ayrımı (schema vs database) ORKA tarafında nasıl? (RLS stratejisi buna göre şekillenecek.)
- Soru: Mobil offline için resmi desteklenen ORKA API limitleri nelerdir?

## 12. Sonraki Adımlar
1. Swagger şemaları için güvenli proxy erişimi veya manuel export temini.
2. packages/sdk içinde orval.config.ts ve shared fetcher dosyalarının oluşturulması.
3. Domain paketinde Ticari/Stok aggregate ve use-case implementasyon iskeleti çıkarılması.
4. Auth context ve token yenileme servislerinin @orka/domain/auth içinde kodlanması.
5. apps/web ve apps/mobile için auth guard + tenant seçici prototipleri.
6. CI pipeline’ında OpenAPI snapshot testi eklenmesi.
```
