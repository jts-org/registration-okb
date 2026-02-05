# Ylläpitäjän Käyttöohje

## Oulun Kickboxing ry - Hallintapaneeli

---

## Sisällysluettelo

1. [Johdanto](#johdanto)
2. [Kirjautuminen hallintapaneeliin](#kirjautuminen-hallintapaneeliin)
3. [Leirien hallinta](#leirien-hallinta)
4. [Kurssien hallinta](#kurssien-hallinta)
5. [Tietojen tallentuminen](#tietojen-tallentuminen)
6. [Usein kysytyt kysymykset](#usein-kysytyt-kysymykset)

---

## Johdanto

Hallintapaneeli on tarkoitettu Oulun Kickboxing ry:n ylläpitäjille leirien ja kurssien hallintaan. Tämän käyttöliittymän kautta voit lisätä, muokata ja poistaa leirejä sekä kursseja.

**Huom:** Hallintapaneeliin pääsy vaatii ylläpitäjän salasanan.

---

## Kirjautuminen hallintapaneeliin

1. Avaa selain ja siirry rekisteröintijärjestelmän osoitteeseen
2. Päävalikosta valitse **"Admin"**
3. Syötä ylläpitäjän salasana avautuvaan dialogiin
4. Klikkaa **"OK"** kirjautuaksesi sisään

Jos salasana on väärä, näet virheilmoituksen. Voit yrittää uudelleen tai peruuttaa painamalla **"Peruuta"**.

---

## Leirien hallinta

Hallintapaneelin **"Leirit"**-välilehdellä voit hallita kaikkia leirejä.

### Leirilistan näkymä

Kun avaat Leirit-välilehden, näet listan kaikista järjestelmään tallennetuista leireistä. Jokainen leirikortti näyttää:

- **Leirin nimi** (esim. KEVÄTLEIRI)
- **Vetäjä** (leirin ohjaaja)
- **Päivät** (leirin päivämäärät ja sessioiden määrä per päivä)

### Uuden leirin lisääminen

1. Klikkaa **"+ Lisää uusi leiri"** -painiketta
2. Täytä lomake:
   - **Leirin nimi**: Syötä leirin nimi (tallennetaan isoilla kirjaimilla)
   - **Vetäjä**: Syötä leirin ohjaajan nimi
   - **Päivät**: Lisää leirin päivät
     - Valitse päivämäärä kalenterista
     - Syötä sessioiden määrä kyseiselle päivälle

3. Voit lisätä useita päiviä klikkaamalla **"+ Lisää päivä"**
4. Voit poistaa päivän klikkaamalla päivän vieressä olevaa **"×"**-painiketta
5. Klikkaa **"Tallenna"** tallentaaksesi leirin
6. Tai klikkaa **"Peruuta"** peruuttaaksesi toiminnon

### Leirin muokkaaminen

1. Etsi muokattava leiri listalta
2. Klikkaa leirikortin **"Muokkaa"**-painiketta
3. Muokkaa haluamiasi tietoja lomakkeessa
4. Klikkaa **"Tallenna"** tallentaaksesi muutokset
5. Tai klikkaa **"Peruuta"** peruuttaaksesi muutokset

### Leirin poistaminen

1. Etsi poistettava leiri listalta
2. Klikkaa leirikortin **"Poista"**-painiketta
3. Vahvistusikkuna avautuu - varmista että haluat poistaa leirin
4. Klikkaa **"Poista"** vahvistaaksesi poiston
5. Tai klikkaa **"Peruuta"** peruuttaaksesi toiminnon

**Varoitus:** Poistettua leiriä ei voi palauttaa!

---

## Kurssien hallinta

Hallintapaneelin **"Kurssit"**-välilehdellä voit hallita kaikkia kursseja.

### Kurssilistan näkymä

Kun avaat Kurssit-välilehden, näet listan kaikista järjestelmään tallennetuista kursseista. Jokainen kurssikortti näyttää:

- **Kurssin nimi** (esim. PEKU, JATKO, KUNTO)
- **Kurssityyppi** (värikoodattu merkki)
- **Alkupäivä** ja **Loppupäivä**

### Kurssityypit

| Tyyppi | Väri | Kuvaus |
|--------|------|--------|
| Peruskurssi | Sininen | Aloittelijoiden peruskurssi |
| Jatkokurssi | Violetti | Jatkokurssi kokeneemmille |
| Kuntokurssi | Vihreä | Kuntoharjoittelukurssi |

### Uuden kurssin lisääminen

1. Klikkaa **"+ Lisää uusi kurssi"** -painiketta
2. Täytä lomake:
   - **Kurssityyppi**: Valitse alasvetovalikosta (Peruskurssi, Jatkokurssi tai Kuntokurssi)
   - **Kurssin nimi**: Syötä kurssin nimi (esim. PEKU)
   - **Alkupäivä**: Valitse kurssin alkamispäivä
   - **Loppupäivä**: Valitse kurssin päättymispäivä

3. Klikkaa **"Tallenna"** tallentaaksesi kurssin
4. Tai klikkaa **"Peruuta"** peruuttaaksesi toiminnon

### Kurssin muokkaaminen

1. Etsi muokattava kurssi listalta
2. Klikkaa kurssikortin **"Muokkaa"**-painiketta
3. Muokkaa haluamiasi tietoja lomakkeessa
4. Klikkaa **"Tallenna"** tallentaaksesi muutokset
5. Tai klikkaa **"Peruuta"** peruuttaaksesi muutokset

### Kurssin poistaminen

1. Etsi poistettava kurssi listalta
2. Klikkaa kurssikortin **"Poista"**-painiketta
3. Vahvistusikkuna avautuu - varmista että haluat poistaa kurssin
4. Klikkaa **"Poista"** vahvistaaksesi poiston
5. Tai klikkaa **"Peruuta"** peruuttaaksesi toiminnon

**Varoitus:** Poistettua kurssia ei voi palauttaa!

---

## Tietojen tallentuminen

Kaikki leirit ja kurssit tallentuvat automaattisesti Google Sheets -taulukkoon:

### Leirit (camps-välilehti)

| Sarake | Sisältö |
|--------|---------|
| A | ID (automaattinen) |
| B | Tyyppi ("camp") |
| C | Leirin nimi |
| D | Vetäjä |
| E, F | Päivä 1: päivämäärä, sessiot |
| G, H | Päivä 2: päivämäärä, sessiot |
| ... | Lisää päiviä tarpeen mukaan |

### Kurssit (sessions-välilehti)

| Sarake | Sisältö |
|--------|---------|
| A | ID (automaattinen) |
| B | Kurssityyppi (basic/advanced/fitness) |
| C | Kurssin nimi |
| D | Alkupäivä |
| E | Loppupäivä |

---

## Usein kysytyt kysymykset

### K: Unohdin ylläpitäjän salasanan. Mitä teen?

V: Ota yhteyttä järjestelmän pääylläpitäjään salasanan nollausta varten.

### K: Voinko peruuttaa vahingossa tehdyn poiston?

V: Valitettavasti ei. Poistetut tiedot voi kuitenkin palauttaa Google Sheets -taulukon versiohistoriasta (Tiedosto → Versiohistoria → Näytä versiohistoria).

### K: Miksi kurssini ei näy harrastajien ilmoittautumislomakkeella?

V: Varmista, että:
1. Kurssin alkupäivä on jo alkanut
2. Kurssin loppupäivä ei ole vielä mennyt
3. Kurssi on tallennettu onnistuneesti

### K: Kuinka monta päivää leirille voi lisätä?

V: Leirille voi lisätä rajattomasti päiviä. Jokainen päivä tallennetaan omana päivämäärä-sessiot -parina.

### K: Voinko muokata usean leirin/kurssin tietoja samanaikaisesti?

V: Ei, järjestelmä tukee yhden leirin/kurssin muokkaamista kerrallaan. Tallenna muutokset ennen seuraavan muokkaamista.

### K: Näkyvätkö tekemäni muutokset heti käyttäjille?

V: Kyllä, muutokset tallentuvat ja päivittyvät reaaliaikaisesti.

---

## Navigointi

- Klikkaa **"Päävalikko"** palataksesi etusivulle
- Vaihda välilehtiä klikkaamalla **"Leirit"** tai **"Kurssit"**

---

## Tuki

Jos kohtaat ongelmia järjestelmän käytössä, ota yhteyttä:

- Sähköposti: [seuran sähköpostiosoite]
- Puhelin: [seuran puhelinnumero]

---

*Käyttöohje päivitetty: Helmikuu 2026*
