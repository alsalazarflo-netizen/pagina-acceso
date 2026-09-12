<script>
  import { onMount } from "svelte";
  import DeepSea from "./lib/DeepSea.svelte";
  import { clearSession, getToken, login, me, saveSession } from "./lib/auth.js";

  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let loading = $state(false);
  let checking = $state(true);
  let error = $state("");
  let usuario = $state(null);

  onMount(async () => {
    if (!getToken()) {
      checking = false;
      return;
    }
    try {
      usuario = (await me()).usuario;
    } catch {
      clearSession();
    } finally {
      checking = false;
    }
  });

  async function onSubmit(e) {
    e.preventDefault();
    error = "";
    loading = true;
    try {
      const data = await login(email.trim(), password);
      saveSession(data.token, data.usuario);
      usuario = data.usuario;
      password = "";
    } catch (err) {
      error = err.message;
    } finally {
      loading = false;
    }
  }
</script>

<svelte:head>
  <title>Aqua · Acceso</title>
</svelte:head>

<DeepSea />

<main class="relative z-10 flex min-h-screen items-center justify-center p-6">
  {#if checking}
    <p class="text-sm text-white/80">Cargando…</p>
  {:else if usuario}
    <section class="w-full max-w-md rounded-3xl border border-white/25 bg-white/15 p-8 text-white shadow-2xl backdrop-blur-md">
      <p class="text-xs tracking-[0.22em] text-cyan-100 uppercase">Sesión activa</p>
      <h1 class="mt-2 font-display text-4xl">Hola, {usuario.nombre.split(" ")[0]}</h1>
      <p class="mt-2 text-sm text-white/70">{usuario.email} · {usuario.rol}</p>
      <button
        class="mt-8 w-full rounded-2xl border border-white/30 py-3 text-sm"
        onclick={() => {
          clearSession();
          usuario = null;
        }}>Cerrar sesión</button
      >
    </section>
  {:else}
    <form
      class="w-full max-w-sm rounded-3xl border border-white/25 bg-white/15 p-6 text-white shadow-2xl backdrop-blur-md"
      onsubmit={onSubmit}
    >
      <p class="text-xs tracking-[0.28em] text-cyan-100 uppercase">Aqua</p>
      <h1 class="mt-2 font-display text-3xl">Iniciar sesión</h1>
      <p class="mt-1 mb-5 text-sm text-white/70">Accede a tu cuenta</p>
      <input
        class="mb-3 w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm outline-none placeholder:text-white/40"
        type="email"
        placeholder="correo"
        bind:value={email}
        required
      />
      <div class="relative mb-3">
        <input
          class="w-full rounded-2xl border border-white/20 bg-white/10 px-4 py-3 pr-14 text-sm outline-none placeholder:text-white/40"
          type={showPassword ? "text" : "password"}
          placeholder="contraseña"
          bind:value={password}
          required
          minlength="8"
        />
        <button type="button" class="absolute top-1/2 right-3 -translate-y-1/2 text-xs text-white/70" onclick={() => (showPassword = !showPassword)}>
          {showPassword ? "Ocultar" : "Ver"}
        </button>
      </div>
      {#if error}<p class="mb-3 text-sm text-red-200">{error}</p>{/if}
      <button class="w-full rounded-2xl bg-cyan-200 py-3 text-sm font-medium text-cyan-950 disabled:opacity-50" disabled={loading}>
        {loading ? "…" : "Entrar"}
      </button>
    </form>
  {/if}
</main>
