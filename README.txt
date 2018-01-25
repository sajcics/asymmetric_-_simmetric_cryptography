English:
Steps to start project:
1. install node.js
2. go to project folder and run: sudo npm install
3. also run: sudo nodemon backend.js to start script
4. open index.html
If textarea is not loaded from file fileToEncrypt.txt then some of the
steps are not properly done

//NOTE: project is supported for win32, linux64 and linux32
Details of project see on wiki page.


Croatian:
Koraci za pokretanje programa na linux ubuntu 16.04:
1. instalirati node.js 8.0.0
2. otvoriti datoteku projekta i pokrenuti: sudo npm install
3. također pokrenuti: sudo nodemon backend.js za pokretanje skripte
4. otvoriti index.html
Ukoliko u prvom polju textarea nije učitana datoteka fileToEncrypt.txt
tada neki od navedenih koraka niste dobro napravili.

//NOTE: projekt je podržan na win32, linux64 i linux32
Primjer korištenja:
1. gumb "generiranje asimetrično" generira
  - privatni ključ
  - javni ključ
  - kriptira jasnu poruku
  - dekriptira kriptiranu poruku tako što učita iz datoteke fileEncryptedAsimetric.txt
  - sažetak

2. gumb "generiranje simetrično" generira
  - tajni ključ
  - kriptira jasnu poruku
  - dekriptira kriptiranu poruku tako što učita iz datoteke fileEncryptedSimetric.txt

3. gumb "generiraj digitalni potpis" generira
  - učitava jasnu poruku iz datoteke "fileToEncrypt.txt"
  - učitava sažetak iz datoteke "hash/hash-sha256.txt" koji je kreiran u
  2 koraku (gumb "generiraj simetrično")
  - kriptira sažetak jasne poruke sa tajnim ključem
  - sprema generirani potpis u datoteku "digitalSignatureEncrypted"

4. gumb "dekriptiraj digitalni potpis" generira
  - učitava kriptirani digitalni potpis iz datoteke "digitalSignatureEncrypted.txt"
  - učitava jasnu poruku iz datoteke "fileToEncrypt.txt"
  - izračunava sažetak sha256 jasne poruke
  - dekriptira kriptirani digitalni potpis sa javnim ključem i uspoređuje
  izračunati sažetak sa dobivenim

5. Da se dobije greška kod izračuna digitalnog potpisa treba odraditi sljedeće:
  - pritisnuti gumb "generirati asimetrično"
  - pritisnuti gumb "generiraj digitalni potpis"
  - pritisnuti gumb "dekriptiraj digitalni potpis"
  - promjeniti sadržaj unutar textarea ili jasne poruke i spremiti izmjene
  - ponovo pritisnuti gumb "dekriptiraj digitalni potpis"
  - ukoliko je dobiveni sažetak drugačiji od izračunatog (jasne poruke
  i dekriptirani od kriptiranog digitalnog potpisa) vraća poruku "podaci su izmjenjeni"
  u protivnom "podaci nisu izmjenjeni"

6. Ukoliko ne postoje javni, tajni ili privatni kljuc a generira se:
  - asimetrično
  - simetrično
  - ili digitalni potpis
  javlja poruku da određene datoteke za izvršenje istog nedostaju

7. Ukoliko ne postoji jasna poruka spremljena u datoteci tada se ne može izvesti
 niti jedna operacija
