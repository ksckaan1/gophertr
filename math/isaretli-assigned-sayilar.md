# İşaretli (Assigned) Sayılar

İşaretli sayılar, burada doğal sayılar anlamında kullanılmıştır. Yani negatif, nötr ve pozitif sayılar.

Ufak tüyolarla ilerleyerek konumuzu görelim.

Öncelikle bir integer sayının yönünü nasıl değiştireceğimize bakalım.

```go
func main() {
	var a int = 5
	var sonuc = a * -1
	fmt.Println("sonuç:", sonuc) // -5
}
```

Bir sayının `-1` ile çarpımı o sayının ters yönlü halini verir. Burada hem fikiriz.&#x20;

<img src="../.gitbook/assets/file.drawing (3).svg" alt="" class="gitbook-drawing">

Peki Go'da bunun kısa yolu nedir?

```go
func main() {
	var a int = 5
	var sonuc = -a
	fmt.Println("sonuç:", sonuc) // -5
}
```

Burada a değişkeninin soluna eksi koyarak a'yı -1 ile çarpmış oluyor. Dikkat edilmesi gereken nokta eksinin sayıyı eksi yönde değil de, ters yönde çevirmesidir.

Bu yüzden -1 ile çaptığını düşünmek gerekir. a değişkenimizin değeri -5 olsaydı sonucumuz 5 olurdu. Yani eksi \* artı = eksi şeklinde düşünebiliriz.

Aynı işlemi bir de artı kullanarak deneyelim.

```go
func main() {
	var a int = -5
	var sonuc = +a
	fmt.Println("sonuç:", sonuc) // -5
}
```

Burada da a değişkenimizi +1 ile çarptık. Eksi ile artının çarpımı eksi çıkacağı için sonucumuz -5 çıktı. Bu örnekte artı kullanımının sayının yönünü değiştirmediğini görebiliriz.

Özet olarak değişkenimizin başına eksi veya artı koyarak -1 veya +1 ile çarpımış oluyoruz.

{% hint style="info" %}
Sayımızın yönünü değiştirirdikten sonra sayımız negatif yönde olabileceğiden sonuc için uint veri tipini kullanamayız.

uint = unassigned integer
{% endhint %}
