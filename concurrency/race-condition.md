# Race Condition

## Race Condition Nedir?

Race condition, hafızada bulunan ve ortak kullanılan bir veriye aynı anda birden fazla thread ile ulaşılıp değişiklik yapılmasıyla istenmeyen bir sonuç elde edilmesi durumdur. Kısaca bug veya doğru çalışmama olarak nitelendirilir.

Bu durum ile karşılaştığımız basit bir senaryo görelim.

```go
package main

import (
	"fmt"
)

func main() {
	var a = []int{}

	ekle(&a)
	ekle(&a)
	ekle(&a)
	ekle(&a)
	ekle(&a)
	ekle(&a)
	ekle(&a)
	ekle(&a)
	ekle(&a)
	ekle(&a)
	fmt.Println(a)
}

func ekle(a *[]int) {
	*a = append(*a, 0)
}
```

Yukarıdaki kodlarımız `a` değişkeni üzerinde değişiklik yapan bir örnek içeriyor. Basitçe `ekle()` fonksiyonumuzu 10 kere çalıştırarak, terminalimize `a`'nın değerini bastırdık. Yukarıdakilere göre sonucumuz bariz bir şekilde içerisinde 10 adet 0 olan bir dizi olacaktır.

> \[0 0 0 0 0 0 0 0 0 0]



Fakat ekleme işlemi yapan fonksiyonumuzu 10 defa arka arka değilde, goroutine ile 10 defa aynı anda çalıştırmış olsaydık ne olurdu?

Tüm fonksiyonların runtime zaman içinde çalışması için `waitgroup` kullanabiliriz.

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	wg := sync.WaitGroup{}

	wg.Add(10)
	var a = []int{}

	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)
	go ekle(&a, &wg)

	wg.Wait()

	fmt.Println(a)

}

func ekle(a *[]int, wg *sync.WaitGroup) {
	*a = append(*a, 0)
	wg.Done()
}
```

Siz de denediğinizde farkedecektirsiniz ki, programı birden fazla çalıştırdığınızda farklı sonuçlar elde ediyorsunuz. İnsan içerisinde 10 tane 0 bulunan bir dizi görmek istiyor ama maalesef göremiyor.

> \[0 0 0 0 0]
>
> \[0 0 0 0 0 0 0 0 0]
>
> \[0 0 0 0 0 0 0]

Arkaplanda gerçekleşen olaya değinelim.

`append()` fonksiyonumuz aslında `a` dizisine bir değer eklemiyor. Eklendiğinde çıkan sonucu veriyor ve bu sonucu `a` dizisine yeniden atama yapıyoruz. Böylelikle ekleme yapılmış oluyor. Bu esnada `a` dizisine diğer goroutine ile çalışan thread'ler etki ettiğinde diğer sonuçları yok sayıp üzerine yazıyor.  Yani `append()` fonksiyonunun `a`'nın değerini alması ve yeniden `a`'ya değer ataması arasındaki olan diğer işlemlerin üzerine yazıp onları yok saymış oluyor. Bu sebeple herzaman aynı sonuç elde edilmiyor.

Race condition durumlarını tespit edebilmek için kullanılan bir go komut flag'i vardır.

> go run --race .

Yukarıdaki komutu çalıştırdığımızda örneğimizden dolayı bir sürü çıktı veren bir sonuçla karşılaşırız. Bu çıktıyı incelediğimizde hangi satırda kullandığımız thread'in race condition'a sebep olduğunu ve runtime sırasında kaç adet race condition'a rastlandığını bize gösterir.

## Mutex

Race condition'ı engellemek için `mutex` kullanabiliriz. `Mutex` ile istediğimiz değişkene aynı esnada sadece bir thread'in erişmesini sağlayabiliriz. Böylelikle bir thread istediğimiz değişken üzerinde işlem yaparken, diğer thread işlem bittikten sonra kendi işlemini gerçekleştirir. Böylelikle race condition gerçekleşmez.

Mutex kilitleme ve açma işlemimizi, işlem yapacağımız değişkeni kapsayacak şekilde yapmalıyız.

```go
package main

import (
	"fmt"
	"sync"
)

func main() {
	wg := sync.WaitGroup{}
	mt := sync.Mutex{}

	wg.Add(10)
	var a = []int{}

	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)
	go ekle(&a, &wg, &mt)

	wg.Wait()

	fmt.Println(a)
}

func ekle(a *[]int, wg *sync.WaitGroup, mt *sync.Mutex) {
	mt.Lock()
	*a = append(*a, 0)
	mt.Unlock()
	wg.Done()
}
```

WaitGroup ve Mutex'i kullandığımız örneklerde farklı kod bloğunda kullandığımız için bellekteki adresini işaret ederek (yani pointer) kullandık. Bunun sebebi pointer kullanmadan, fonksiyon içerisine verdiğimizde kopyalanma olacağı için mutex veya waitgroup'un asıl adresinde tanımlandığından ayrı bir şekilde çalışmasıdır. Örnek olarak mutex'i pointer ile vermeseydik, farklı mutex'ler tarafından kilitleme işlemi yapılacağı için yine farklı bir dizi ile karşılaşırdık.

Zaten mutex yapısında da açıklama olarak yazılmış.

![](<../.gitbook/assets/Screen Shot 2022-05-10 at 01.07.15.png>)

Bu işlemleri uyguladıktan sonra çıktımız istediğimiz gibi 10 tane 0 içeren dizi olacaktır.

> \[0 0 0 0 0 0 0 0 0 0]
