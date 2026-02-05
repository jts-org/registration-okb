# Vetäjän Käyttöohje

## Oulun Kickboxing ry - Treenisession Rekisteröintijärjestelmä

---

## Sisällysluettelo

1. [Johdanto](#johdanto)
2. [Järjestelmään kirjautuminen](#järjestelmään-kirjautuminen)
3. [Valmennussessioon ilmoittautuminen](#valmennussessioon-ilmoittautuminen)
4. [Harrastajien ilmoittautumiset](#harrastajien-ilmoittautumiset)
5. [Usein kysytyt kysymykset](#usein-kysytyt-kysymykset)

---

## Johdanto

Tämä ohje on tarkoitettu Oulun Kickboxing ry:n vetäjille ja ohjaajille. Järjestelmän avulla voit rekisteröidä oman osallistumisesi valmennussessioihin sekä seurata harrastajien ilmoittautumisia.

---

## Järjestelmään kirjautuminen

### Päävalikko

1. Avaa selain ja siirry rekisteröintijärjestelmän osoitteeseen
2. Näet päävalikon kolmella vaihtoehdolla:
   - **Harjoitussessiot** - Harrastajien ilmoittautuminen
   - **Vetäjät** - Ohjaajien ilmoittautuminen
   - **Admin** - Ylläpito

### Vetäjänäkymään kirjautuminen

1. Klikkaa **"Vetäjät"**-painiketta
2. Näet salasanaikkunan otsikolla **"Vetäjän kirjautuminen"**
3. Syötä vetäjien salasana
4. Klikkaa **"OK"**

**Huom!** Jos syötät väärän salasanan:
- Näet virheilmoituksen "Väärä salasana"
- Järjestelmä palaa automaattisesti päävalikkoon

Jos klikkaat **"Peruuta"**, palaat päävalikkoon.

---

## Valmennussessioon ilmoittautuminen

### Vaihe 1: Valitse ryhmä

Kirjautumisen jälkeen näet vetäjän rekisteröintilomakkeen. Valitse ryhmä, jota olet vetämässä:

| Ryhmä | Kuvaus |
|-------|--------|
| JATKO | Jatkoryhmä |
| KUNTO | Kuntoharjoittelu |
| PERUS | Peruskurssi |
| VAPAA/SPARRI | Vapaaharjoittelu ja sparraus |

Klikkaa haluamaasi ryhmää - valittu ryhmä korostuu vihreällä.

### Vaihe 2: Tarkista päivämäärä

Järjestelmä näyttää automaattisesti kuluvan päivän päivämäärän. Voit muuttaa päivämäärää tarvittaessa kalenterivalitsimesta.

### Vaihe 3: Syötä nimesi

Täytä seuraavat kentät:

1. **Etunimi** - Kirjoita etunimesi
2. **Sukunimi** - Kirjoita sukunimesi

### Vaihe 4: Lähetä ilmoittautuminen

1. Kun kaikki kentät on täytetty, **"Ilmoittaudu"**-painike aktivoituu
2. Klikkaa **"Ilmoittaudu"**
3. Näet yhteenvedon ilmoittautumisestasi:
   - Harjoitusryhmä
   - Päivämäärä
   - Etunimi
   - Sukunimi

4. Tarkista tiedot ja valitse:
   - **OK** - Vahvista ilmoittautuminen
   - **Peruuta** - Palaa muokkaamaan tietoja

### Vaihe 5: Palaa päävalikkoon

Ilmoittautumisen jälkeen voit palata päävalikkoon klikkaamalla **"Päävalikko"**-painiketta sivun yläreunassa.

---

## Harrastajien ilmoittautumiset

Vetäjänä sinulla on pääsy Google Sheets -taulukkoon, jossa näet kaikki harrastajien ilmoittautumiset.

### Taulukon rakenne (trainees-välilehti)

| Sarake | Sisältö |
|--------|---------|
| A | ID (automaattinen) |
| B | Etunimi |
| C | Sukunimi |
| D | Ikäryhmä |
| E | Harjoitusryhmä |
| F | Päivämäärä || G | Ikä (vain alle 18-vuotiaat) |
### Raportit

Järjestelmä generoi automaattisesti raportteja eri harjoitusryhmille:

- **trainees_over_18_jatko** - 18+ vuotiaat JATKO-ryhmässä
- **trainees_over_18_kunto** - 18+ vuotiaat KUNTO-ryhmässä
- **trainees_under_18_jatko** - Alle 18-vuotiaat JATKO-ryhmässä
- **trainees_under_18_kunto** - Alle 18-vuotiaat KUNTO-ryhmässä
- jne.

---

## Usein kysytyt kysymykset

### Unohdin salasanan, mitä teen?

Ota yhteyttä seuran ylläpitäjään (admin), joka voi antaa salasanan tai vaihtaa sen.

### Voinko nähdä kuka on ilmoittautunut treeniin?

Kyllä, pääset tarkastelemaan ilmoittautumisia Google Sheets -taulukon kautta. Pyydä pääsy ylläpitäjältä.

### Miten perun oman ilmoittautumiseni?

Tällä hetkellä ilmoittautumisen peruminen tehdään suoraan Google Sheets -taulukossa poistamalla rivi.

### Voinko ilmoittautua useampaan sessioon samana päivänä?

Kyllä, voit ilmoittautua vetäjäksi useampaan ryhmään samana päivänä.

### Näkyykö ilmoittautumiseni harrastajille?

Ei, vetäjien ilmoittautumiset tallentuvat erilliselle välilehdelle (coaches).

### Mitä eroa on vetäjän ja harrastajan ilmoittautumisessa?

| Ominaisuus | Harrastaja | Vetäjä |
|------------|------------|--------|
| Salasana | Ei vaadita | Vaaditaan |
| Ikäryhmän valinta | Kyllä | Ei |
| Tallennuspaikka | trainees-välilehti | coaches-välilehti |

---

## Salasanan hallinta

### Salasanan vaihtaminen

Salasana tallennetaan Google Sheets -taulukon **settings**-välilehdelle:

| Rivi | Tyyppi | Salasana |
|------|--------|----------|
| 1 | admin | [admin-salasana] |
| 2 | coach | [vetäjä-salasana] |

Ylläpitäjä voi vaihtaa salasanan muokkaamalla taulukkoa suoraan.

---

## Tekninen tuki

Jos kohtaat ongelmia järjestelmän käytössä:

1. Varmista että käytät modernia selainta (Chrome, Firefox, Edge)
2. Kokeile tyhjentää selaimen välimuisti
3. Tarkista internet-yhteys
4. Ota yhteyttä ylläpitäjään

---

## Yhteystiedot

Jos sinulla on kysyttävää järjestelmän käytöstä:

- **Oulun Kickboxing ry**
- Sähköposti: [seuran sähköposti]
- Verkkosivut: [seuran verkkosivut]

---

*Päivitetty: Helmikuu 2026*
