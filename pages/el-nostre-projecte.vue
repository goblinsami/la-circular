<template>
  <div class="container page-section">
    <section aria-labelledby="project-title">
      <div class="page-heading">
        <p class="eyebrow">Arrelats al barri</p>
        <h1 id="project-title">El nostre <em>projecte.</em></h1>
        <p class="lead">Un espai proper. Una manera de cuidar-nos.</p>
      </div>
      <div class="project-grid">
        <div class="prose">
          <p>
            La Circular neix amb la idea de ser una botiga de dietètica propera,
            arrelada al barri i a les persones que en formen part.
          </p>
          <p>
            Creiem en un tracte de tu a tu, en escoltar i en ajudar-te a trobar
            opcions que encaixin amb el teu dia a dia.
          </p>
          <NuxtLink class="button" to="/productes"
            >Descobreix els nostres productes
            <span aria-hidden="true">↗</span></NuxtLink
          >
        </div>
        <aside class="card project-note" aria-label="La nostra filosofia">
          <span class="small-dot" aria-hidden="true"></span>
          <h2>Petits gestos.<br />Benestar quotidià.</h2>
          <p>Ens agrada fer les coses amb calma, amb cura i amb proximitat.</p>
        </aside>
      </div>
    </section>
  </div>
</template>
