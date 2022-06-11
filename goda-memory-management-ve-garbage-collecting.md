# Go'da Memory Management ve Garbage Collecting

## Memory Management Nedir?

Programlar, runtime sırasında bellekte yer ayırırlar. Ayrılan bu yerlerin lazım olmadığı durumda serbest bırakılmasına **memory management** (bellek yönerimi) denir. Memory Management, programın çalışma sırasında hafızayı verimli, optimal ve minimal bir şekilde kullanması için gereklidir.

### Manual Memory Management Nedir?

Manuel hafıza yönetiminin ne olduğunu anlamak için bir örnek görelim.

Örneğimizde, bir iş yeri için yemekhanemiz olduğunu düşünelim. Yemekhanemiz burada **RAM**'imiz oluyor.

Yemekhanemize çalışanlar geliyor ve masalara oturuyorlar. Masalar, bizim RAM'imizdeki bloklar oluyor. Çalışanlar ise programdaki bileşenler (fonksiyonlar vs.) oluyor. Çünkü iş yapıyorlar.

Çalışanlar arkadaş grubu büyüklüğüne göre boşta olan masalardan birini seçiyor ve seçilen masaya oturuyorlar. Böylece arkadaş grubuna masa tahsis (allocation) ediliyor. Yani veri tipinin uzunluğuna göre bellekte yer ayrılıyor.

Değerli çalışanlarımız ayrılan masada yiyor ve içiyor. Yani masayı kullanıyor. Haliyle de masada çöpleri oluyor.

Karınlarını doyurduktan sonra başka çalışanlarında masaya oturabilmesi için masayı topluyorlar. Böylece başka çalışanlarda masayı kullanabiliyor. Yani hafızada kullandıkları bloğu serbest bırakıyorlar.

Buradaki örneğimizde benzetilmek istenen şey, yemeği yiyen masayı temizlediği için manuel hafıza yönetimidir.

Ana fikir olarak manual memory management'ta değerlere bellekte tahsis edilen yerler, artık bize lazım olmadığı zaman serbest bırakmamız gerekiyor. Böylece belleği verimli bir şekilde kullanmış oluruz.

Manuel memory management yapılan bir dil olduğu için C üzerinden basit bir örnek görelim.

```c
#include <stdlib.h>
#include <stdio.h>

int main()
{
    int *x = malloc(8);
    // Bellekte 8 bitlik yer ayırdık. (00000000)

    *x = 5;
    // Ayırdığımız adrese değer atadık. (00000101)

    printf("Value: %d - Location: %p\n", *x, x);
    // Value: 5 - Location: 0x55a6b2d6b2a0

    free(x);
    // x'i serbest bıraktık. Yani programa artık x ile işimiz olmadığını söyledik.

    printf("Value: %d - Location: %p\n", *x, x);
    // Eğer aynı adres başka bir değer için ayrılmazsa değerimiz aynı gözükecektir.

    return 0;
}
```

### Automatic Memory Management Nedir?

Önceki örneğimizdeki çalışanların, bu sefer değişiklik olsun diye yemekhanede değil de, restorana gittiklerini düşünelim.

Önceki örnekteki gibi arkadaş grubu büyüklüğüne göre restorandaki bir masaya oturuyorlar ve yiyip içiyorlar. Doyunca masadan kalkıyorlar.

Daha sonra müşterinin masada bıraktığı yiyecek ve içecek çöpleri garson tarafından temizleniyor. Burada garsonumuz **garbage collector** oluyor.

Garson masayı temizlediği için restorana yeni müşteri geldiği zaman bu masamız tekrar kullanıma serbest olacak. Yani garson C'deki `free()` fonksiyonu işlevini gördü.

Müşterilerin restoranda masalara oturup bu masaları kullandıktan sonra garson tarafından masalarının temizlenmesi **Automatic Memory Management** oluyor.

Automatic Memory Management yapan birime ise **Garbace Collector** deniyor.

Bilin bakalım hangi dilde garbage collector var :sunglasses:?

Garbage Collection işlemini altmaya geçmeden önce, RAM'de bulunan mantıksal bölümlerden Stack ve Heap kavramlarını öğrenmek faydalı olacaktır.

#### Stack Nedir?

Stack, RAM'de bulunan ve veri saklayan bir yapıdır. LIFO - Last In First Out (Son Giren İlk Çıkar) mantığı ile çalışır. Burada saklanılan veriye hızlıca ulaşılabilir. Boyutu belirli olan verilerin Stack üzerinde tutulması daha mantıklıdır.

<img src=".gitbook/assets/file.drawing (9).svg" alt="Temsili Stack" class="gitbook-drawing">



#### Stack Overflow Hatası Nedir?

Bu hatanın kaynaklanma sebebi, Stack üzerinde ayrılan alanın (frame'in) taşması, yani oluşan verinin bu Stack alanına sığmamasıdır.

C dilinde bir Stack Overflow hatası örneği görelim.

```c
// Stack Overflow Örneği

#include <stdio.h>

void fun(int a)
{
    if (a == 0)
        return;
    a += 1;
    printf("\n");
    printf("%d", a);
    fun(a);
}

int main()
{
    int a = 5;
    fun(a);
}
```

#### Heap Nedir?

Heap, RAM'de bulunur ve veri saklar. Fakat sıralı bir yapı değildir, hatta bir yapı değildir. Bu yüzden kontrol edilmesi ve düzenlenmesi gerekir. Stack'e oranla yavaştır. Saklayacağı verinin boyutu sınırlı değildir. Boyutu belli olmayan veya ilkel olmayan nesneler bu bölümde saklanır. Genişleyip daralabilir. Heap'te  bulunan değişkenler otomatik olarak temizlenmez. Bunun manuel veya garbage collector ile yapılması gerekir.

#### Stack ve Heap İlişkisi

Stack üzerinde daha belirli olan değerlerin saklandığını söylemiştik. Eğer genişleyen boyut veya bir yapı söz konusu ise Heap'te saklanır. Bunu da söyledik. Stack ve Heap arasındaki ilişki ise Heap'te bulunan herbir yapının içindeki alt değerler Stack üzerinde saklanırken, Heap bu değerlerin yapısını ve nasıl ulaşabileceğimizi bize söyler. Yani bir yapıya ulaşmak istediğimizde Heap'den bu verinin Stack'te bulunan referansını alırız. İlkel değer, yani boyutu belli değer ise direkt olarak Stack'te saklanır.

### **Go'da Stack ve Heap**

Go'da işletim sistemi tarafından yönetilen thread'ler (iş parcacıkları) yazılımcıdan soyutlanır ve bunun yerine **Goroutine**'ler ile ilgileniriz. Böylelikle Stack üzerindeki yönetimi işletim sistemi değil de Go devralır. Yani Go'da geliştirici gözünden bakıldığında Stack değil de Goroutine Stack'i ayrılır.

İşletim sistemi tarafından belirlenen katı sınırlar yerine, goroutine stack'leri az miktarda bellekle (şu anda 2KB) başlar.

Her bir fonksiyon çağrısı yürütülmeden önce, Stack Overflow hatası meydana gelmeyeceğini doğrulamak için fonksiyon girişinde bir kontrol yürütülür.

İllaki Stack Overflow hatası ile karşılaşmak istiyorsanız, sizi kırmayayım. Kodlar aşağıda:

```go
package main

import "fmt"

func main() {
	x := 5
	multiply(x)
}
func multiply(x int) int {
	x = x * 5
	fmt.Println(x)
	return multiply(x)
}gg
```

Burada stack overflow ile karşılaşılmasının sebebi, Goroutine'in stack'imizin sınırını en fazla 1GB' yükseltmemize izin vermesidir. Programımızın vereceği çıktıdan bir bölüm görelim.

> runtime: goroutine stack exceeds 1000000000-byte limit
>
> runtime: sp=0xc0200e0378 stack=\[0xc0200e0000, 0xc0400e0000]
>
> fatal error: stack overflow

### Go Garbage Collector

Bu başlık altında Go'daki Garbage Collector'ın çalışma mantığını inceleyeceğiz.&#x20;

Go programlama dili, otomatik otomatik dinamik hafıza yönetimi yapılan ve Garbage Collector içeren bir dildir. Go, C gibi değer odaklı ve prosedürel bir dildir. Prosedürel modelde çalışan programlar çalışacağı sisteme işlem adımlarını sıralı olarak bildirir.

Bu özellik de Go tarafında nesnelerin yaşam-süresinin derleme sırasında, yani program çalışmadan önce belirlenebilmesini sağlar.

Go, belirli durumlar dışında, bellek tahsisini Stack üzerinde yapmayı tercih eder ve derleyici, derlenme zamanında programda yer alan her bir değişken için ne kadar alan ayıracağını tespit eder. Bu işlemlerin tümü derleyicide bulunan prosedürler tarafından belirlenir. Bu tür bellek ayırmaya **geçici bellek ayırma** denir. Bu yüzden geliştiricinin memory management için Stack üzerinde yer tahsisi (malloc) ve serbest **bırakma (dealloc)** gibi işlemleri yapmasına gerek kalmaz.

Programda çalışan fonksiyonlar işlevlerini tamamladıktan sonra işleve ait veriler Stack üzerinden temizlenir. Buraya kadar ki Stack için anlatılanlar, aslında Garbage Collector'ın yaptığı işlemler değildi.

Garbage Collector, runtime (program çalışıyorken) sırasında Heap'te saklanan verileri gereksiz olduğu zaman temizler. Yani işi Stack ile değil de, Heap iledir.

Özetle Go'da derleyici  derlenme esnasında Stack üzerinde alloc ve dealloc işlemlerini belirler. Çalışma esnasında ise Heap için bunu Garbage Collector yapar.

Garbage Collector'lar çalışma esnasında Heap üzerinde ayrılan alanları gözlemlemek, kullanımda olmayan alanları serbest bırakmak ve kullanılan alanları tutmak ile sorumludurlar.

Go'da Garbage Collector'ın davranışı karmaşıktır. Mantığını bilmemek yazılım geliştirmeye bir engel olmasa da yüzeysel olarak anlamak belki merakınızı giderebilir. Bu karışık mekanizma, dile gelen bir güncelleme ile tamamen değişebileceği için her zaman aynı mantıkta çalışmayacağını bilmemiz gerekir.

Zaten Garbage Collector'ların asıl becermek istediği iş, geliştiricinin memory management konusu ile hiç ilgilenmeden geliştirme yapabilmeleridir.

Go'da çöp toplama işlemi temel olarak üç bölümden oluşur.

1.  **Veri almak için ortamı hazırla - STW(Stop The World)**

    Toplama işlemine başlandığında, ilk aşama Heap'te saklanan değerleri yazma işleminin engellenmesidir. Bunun sebebi çöp toplayıcı ve goroutine aynı anlada çalıştığı için Heap'teki veri bütünlüğünü sağlamaktır. Yani çöp toplayıcı serbest bırakılacak alının tespitini doğru yapabilmek için Heap yazma işlemi engelleniyor.



    Yazma bariyeri oluşturulması için çalışan tüm goroutine'lerin durdurulması gerekir. Bu işlem çok kısa sürer. Bu yüzden bu işleme Stop The World (Dünya'yı Durdur) denir.
2.  **Toplanacakları işaretle**

    Toplayıcının yaptığı ilk şey, mevcut CPU kapasitesinin %25'ini kendisi için almaktır. Toplayıcı, çok tahsis olduğunda tahsisleri (heap'te alan oluşturma) yavaşlatması gerektiğini belirlerse, işaretleme (tespit etme) çalışmasına yardımcı olması için Goroutine'ler ile işbirliğine girer. Buna Mark Assist (İşaretleme Yardımı) denir. Böylece toplanacak çöplerin tespiti daha hızlı bitirilmiş olur.

    Çöp tespiti işlemi yardım ile gerçekleştiğinde, bir sonraki toplama işlemi daha erken başlatılır. Böylelikle bir sonraki işaretleme işleminde gerekli olacak İşaret yardımı miktarı azaltılabilir.
3.  **Tespit edilenleri serbest bırak**

    Serbest bırakılacak alan tespit (işaret) edildikten sonraki aşama bunları serbest bırakmaktır. Yani program ile ilişiğinin kesilmesidir. Yazma bariyeri kapatılır ve çeşitli serbest bırakma görevleri yapılır. Daha sonra bir sonraki toplama hedefi hesaplanır. Goroutine'ler tekrar tam gaz çalışmaya devam eder.

Bu işlemlerde aslında temizlikten ziyade Heap'te ayrılan alanın program ile ilişiği kesilmiş olunur. İşlemler gerçekleşirken gördüğümüz üzere programımız durduruluyor ve çöz tespiti ve temizliği yapılıyor. Bu yüzden bu işlemler ile programımız eş zamanlı olarak çalışmıyor.

#### Eşzamanlı Süpürme (Concurrent Sweeping)

Bu işlemde ise Heap üzerinde bir alan ayrıldığında veri taşımadan önce, alan içerisindeki eski değer kalıntıları temizlenir. Bu işlem Garbage Collector'e bağlı değildir. Diğer Goroutine'lere eşzamanlı olarak gerçekleşir.







