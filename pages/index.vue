<template>
  <div class="container">
    <section class="hero" aria-labelledby="home-title">
      <div class="hero-copy">
        <p class="eyebrow">
          <span class="small-dot" aria-hidden="true"></span> Benestar, amb
          proximitat
        </p>
        <h1 id="home-title">Benvinguts a <em>La Circular.</em></h1>
        <p class="lead">La teva botiga de dietètica de barri.</p>
        <p class="body-copy">
          Un espai proper per cuidar-te cada dia. A La Circular volem
          acompanyar-te amb una atenció personal i una selecció de productes per
          al teu benestar.
        </p>
        <div class="hero-actions">
          <NuxtLink class="button" to="/productes"
            >Descobreix els productes
            <span aria-hidden="true">↗</span></NuxtLink
          >
          <NuxtLink class="text-link" to="/el-nostre-projecte"
            >El nostre projecte <span aria-hidden="true">→</span></NuxtLink
          >
        </div>
      </div>
      <div class="hero-art" aria-hidden="true">
        <div class="art-orbit"></div>
        <div class="art-circle">
          <span class="art-caption">LA CIRCULAR</span>
          <p>Cuidar-nos.<br />De manera<br /><em>natural.</em></p>
          <span class="art-sprout"><i></i><i></i></span>
          <span class="art-caption">A PROP TEU</span>
        </div>
        <span class="art-note">Les petites coses de cada dia.</span>
      </div>
    </section>

    <section class="values-section" aria-labelledby="values-title">
      <div class="section-heading">
        <p class="eyebrow">La nostra manera de fer</p>
        <h2 id="values-title">Les persones, al centre.</h2>
      </div>
      <div class="card-grid">
        <article class="card">
          <span class="card-number" aria-hidden="true">01 /</span>
          <h3>A prop teu</h3>
          <p>
            Una botiga de barri, amb temps per escoltar-te i un tracte de tu a
            tu.
          </p>
        </article>
        <article class="card">
          <span class="card-number" aria-hidden="true">02 /</span>
          <h3>Cuidar el dia a dia</h3>
          <p>
            Opcions d’alimentació i cura personal que encaixen amb la teva vida.
          </p>
        </article>
        <article class="card">
          <span class="card-number" aria-hidden="true">03 /</span>
          <h3>Triar amb calma</h3>
          <p>Un espai on compartir dubtes i descobrir allò que necessites.</p>
        </article>
      </div>
    </section>
  </div>
</template>
