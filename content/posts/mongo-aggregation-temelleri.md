---
title: "MongoDB Aggregation Temelleri: Ana Kavramlar ve Örnekler"
short_description: "MongoDB aggregation pipeline'ın temel kavramları, aşamaları ve pratik kullanım örnekleri."
tags: [mongodb, veritabanı, aggregation, nosql]
image: "https://storage.kerim.im/images/mongo_banner.png"
blurhash: "L30V6EieqDi1iyl@eBZ*i7k:g_lQ"
published_at: "2025-04-12T14:00:00.000Z"
---

MongoDB, NoSQL veritabanlarında güçlü veri işleme özellikleriyle dikkat çeker. Aggregation pipeline, MongoDB'de verileri dönüştürmek, gruplamak ve analiz etmek için kullanılan temel bir araçtır. Bu yazıda, MongoDB aggregation pipeline’ın temel kavramlarını, sık kullanılan aşamalarını ve pratik örneklerle nasıl çalıştığını açıklayacağız.

### Aggregation Pipeline Nedir?

Aggregation pipeline, MongoDB'de verilerin bir dizi işlem aşamasından (stages) geçirilerek dönüştürülmesini sağlar. Her aşama, belgeleri işler ve sonucu bir sonraki aşamaya aktarır. Bu, karmaşık veri analizlerini ve özetlemeleri kolayca yapmanızı mümkün kılar.

### Yaygın Aggregation Aşamaları

1. **`$match`**: Verileri filtreler, SQL’deki `WHERE` koşuluna benzer.
2. **`$group`**: Belgeleri bir anahtara göre gruplar ve özet hesaplamalar yapar.
3. **`$sort`**: Sonuçları belirli bir alana göre sıralar.
4. **`$project`**: Çıktıya hangi alanların dahil edileceğini belirler veya yeni alanlar oluşturur.
5. **`$lookup`**: Farklı koleksiyonlardan veri birleştirir, SQL’deki `JOIN` işlemine benzer.
6. **`$addFields`**: Belgelerinize yeni alanlar ekler veya mevcut alanları dönüştürür.

### Örnek 1: Filtreleme ve Gruplama

Diyelim ki bir `orders` koleksiyonunuz var ve her siparişte müşteri kimliği (`customerId`), toplam tutar (`total`) ve tarih (`date`) bulunuyor. Müşteri bazında toplam sipariş tutarını hesaplamak istiyorsunuz:

```js
db.orders.aggregate([
  { $match: { date: { $gte: ISODate("2025-01-01") } } },
  { $group: { _id: "$customerId", totalSpent: { $sum: "$total" } } },
  { $sort: { totalSpent: -1 } },
]);
```

- **`$match`**: 2025 sonrası siparişleri filtreler.
- **`$group`**: Müşterilere göre gruplar ve toplam harcamayı hesaplar.
- **`$sort`**: Sonuçları toplam harcamaya göre azalan sırada sıralar.

### Örnek 2: Alan Dönüştürme ve Filtreleme

Bir `users` koleksiyonunda kullanıcıların isimleri (`name`) ve yaşları (`age`) var. 30 yaşından büyük kullanıcıların sadece isimlerini almak istiyorsunuz:

```js
db.users.aggregate([
  { $match: { age: { $gt: 30 } } },
  { $project: { name: 1, _id: 0 } },
]);
```

- **`$match`**: Yaşı 30’dan büyük kullanıcıları seçer.
- **`$project`**: Sadece `name` alanını döndürür, `_id`’yi hariç tutar.

### Örnek 3: $lookup ile Veri Birleştirme

Farklı koleksiyonlar arasında ilişki kurmak için `$lookup` kullanılır. Örneğin, `orders` koleksiyonundaki siparişlerin müşteri bilgilerini `customers` koleksiyonundan çekmek istiyorsunuz:

```js
db.orders.aggregate([
  { $match: { date: { $gte: ISODate("2025-01-01") } } },
  {
    $lookup: {
      from: "customers",
      localField: "customerId",
      foreignField: "_id",
      as: "customerInfo",
    },
  },
  { $project: { customerInfo: { name: 1 }, total: 1, _id: 0 } },
]);
```

- **`$match`**: 2025 sonrası siparişleri filtreler.
- **`$lookup`**: `orders` koleksiyonundaki `customerId` ile `customers` koleksiyonundaki `_id`’yi eşleştirir ve müşteri bilgilerini `customerInfo` dizisine ekler.
- **`$project`**: Sadece müşteri adı ve sipariş toplamını döndürür.

### Örnek 4: $addFields ile Yeni Alan Ekleme

`orders` koleksiyonunda her sipariş için bir vergi alanı (`tax`) hesaplayıp eklemek istiyorsunuz. Vergi, toplam tutarın %10’u olsun:

```js
db.orders.aggregate([
  { $match: { date: { $gte: ISODate("2025-01-01") } } },
  { $addFields: { tax: { $multiply: ["$total", 0.1] } } },
  { $project: { customerId: 1, total: 1, tax: 1, _id: 0 } },
]);
```

- **`$match`**: 2025 sonrası siparişleri filtreler.
- **`$addFields`**: Her belgeye `total`’ın %10’u olarak bir `tax` alanı ekler.
- **`$project`**: Müşteri kimliği, toplam ve vergi alanlarını döndürür.

### Aggregation’ın Avantajları ve Kullanım Alanları

Aggregation pipeline, büyük veri kümelerinde analiz yapmayı kolaylaştırır. Örneğin:

- **Raporlama**: Satış verilerini özetlemek.
- **Veri Birleştirme**: Farklı koleksiyonlardan verileri bir araya getirmek.
- **Veri Dönüştürme**: Belgeleri farklı bir formata çevirmek veya yeni alanlar eklemek.
- **Filtreleme ve Analiz**: Karmaşık sorgularla veri alt kümeleri oluşturmak.

### Ne Zaman Kullanmalı?

Aggregation, basit sorguların ötesine geçtiğinizde devreye girer. Verilerinizi gruplandırmanız, birleştirmeniz, özetlemeniz veya dönüştürmeniz gerektiğinde aggregation pipeline mükemmel bir seçimdir. Performans için pipeline’ı optimize etmek önemlidir; örneğin, `$match` aşamasını en başa koyarak veri kümesini erkenden küçültmek faydalıdır.

### Sonuç

MongoDB aggregation pipeline, verileri esnek ve güçlü bir şekilde işlemek için vazgeçilmez bir araçtır. `$match`, `$group`, `$sort`, `$project`, `$lookup` ve `$addFields` gibi aşamalar, karmaşık analizleri basit bir akışa dönüştürür. Projenizin ihtiyaçlarına göre bu aşamaları birleştirerek verilerinizden maksimum fayda sağlayabilirsiniz.
