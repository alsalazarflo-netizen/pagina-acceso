<script>
  import { onMount } from "svelte";
  import { clearSession, getToken, login, me, saveSession } from "./lib/auth.js";

  let email = $state("");
  let password = $state("");
  let showPassword = $state(false);
  let loading = $state(false);
  let checking = $state(true);
  let error = $state("");
  let usuario = $state(null);

  const roles = {
    admin: "Administrador",
    gerente: "Gerente",
    empleado: "Empleado",
  };

  onMount(async () => {
    if (!getToken()) {
      clearSession();
      usuario = null;
      checking = false;
      return;
    }

    try {
      const data = await me();
      usuario = data.usuario;
    } catch {
      clearSession();
      usuario = null;
    } finally {
      checking = false;
    }
  });

  async function onSubmit(event) {
    event.preventDefault();
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

  function logout() {
    clearSession();
    usuario = null;
    email = "";
    password = "";
    error = "";
  }
</script>

<div class="relative min-h-screen overflow-hidden">
  <div
    class="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(24,70,60,0.14),_transparent_42%),radial-gradient(circle_at_bottom_right,_rgba(180,120,70,0.12),_transparent_38%)]"
  ></div>
  <div
    class="pointer-events-none absolute -top-24 -right-16 h-72 w-72 rounded-full border border-[#18463c]/15"
  ></div>
  <div
    class="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full border border-[#18463c]/10"
  ></div>

  <main class="relative mx-auto flex min-h-screen max-w-5xl items-center px-6 py-12">
    {#if checking}
      <p class="mx-auto text-sm text-mist">Cargando…</p>
    {:else if usuario}
      <section
        class="mx-auto w-full max-w-lg rounded-3xl border border-stone-200/80 bg-paper p-8 shadow-[0_24px_60px_-28px_rgba(28,25,23,0.45)]"
      >
        <p class="text-xs font-medium tracking-[0.22em] text-pine uppercase">Sesión activa</p>
        <h1 class="font-display mt-3 text-4xl leading-tight text-ink">
          Hola, {usuario.nombre.split(" ")[0]}
        </h1>
        <p class="mt-2 text-mist">Has entrado al sistema de administración.</p>

        <dl class="mt-8 space-y-3 rounded-2xl bg-sand/80 p-5">
          <div class="flex justify-between gap-4 text-sm">
            <dt class="text-mist">Nombre</dt>
            <dd class="font-medium">{usuario.nombre}</dd>
          </div>
          <div class="flex justify-between gap-4 text-sm">
            <dt class="text-mist">Correo</dt>
            <dd class="font-medium">{usuario.email}</dd>
          </div>
          <div class="flex justify-between gap-4 text-sm">
            <dt class="text-mist">Rol</dt>
            <dd class="rounded-full bg-pine px-3 py-1 text-xs font-medium tracking-wide text-white">
              {roles[usuario.rol] || usuario.rol}
            </dd>
          </div>
        </dl>

        <button
          type="button"
          class="mt-8 w-full rounded-2xl border border-stone-300 px-4 py-3 text-sm font-medium text-ink transition hover:bg-sand"
          onclick={logout}
        >
          Cerrar sesión
        </button>
      </section>
    {:else}
      <div class="grid w-full items-center gap-12 md:grid-cols-[1.1fr_0.9fr]">
        <section class="hidden md:block">
          <p class="text-xs font-medium tracking-[0.28em] text-pine uppercase">Interno</p>
          <h1 class="font-display mt-4 max-w-md text-5xl leading-[1.12] text-ink">
            Sistema de administración
          </h1>
          <p class="mt-5 max-w-sm text-base leading-relaxed text-mist">
            Accede con tu cuenta para gestionar usuarios, departamentos y personal.
          </p>
        </section>

        <section
          class="rounded-3xl border border-stone-200/80 bg-paper p-7 shadow-[0_24px_60px_-28px_rgba(28,25,23,0.45)] sm:p-8"
        >
          <div class="mb-7 flex items-center gap-3">
            <span
              class="grid h-11 w-11 place-items-center rounded-2xl bg-pine font-display text-lg text-[#f3eee6]"
            >
              SA
            </span>
            <div>
              <h2 class="text-lg font-medium text-ink">Iniciar sesión</h2>
              <p class="text-sm text-mist">Usa tu correo institucional</p>
            </div>
          </div>

          <form class="space-y-4" onsubmit={onSubmit}>
            <label class="block">
              <span class="mb-1.5 block text-sm font-medium">Correo</span>
              <input
                class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 text-sm outline-none transition placeholder:text-stone-400 focus:border-pine focus:ring-4 focus:ring-pine/10"
                type="email"
                autocomplete="email"
                placeholder="admin@empresa.com"
                bind:value={email}
                required
              />
            </label>

            <label class="block">
              <span class="mb-1.5 block text-sm font-medium">Contraseña</span>
              <div class="relative">
                <input
                  class="w-full rounded-2xl border border-stone-300 bg-white px-4 py-3 pr-12 text-sm outline-none transition placeholder:text-stone-400 focus:border-pine focus:ring-4 focus:ring-pine/10"
                  type={showPassword ? "text" : "password"}
                  autocomplete="current-password"
                  placeholder="••••••••"
                  bind:value={password}
                  required
                  minlength="8"
                />
                <button
                  type="button"
                  class="absolute top-1/2 right-3 -translate-y-1/2 text-xs font-medium text-mist hover:text-ink"
                  onclick={() => (showPassword = !showPassword)}
                >
                  {showPassword ? "Ocultar" : "Ver"}
                </button>
              </div>
            </label>

            {#if error}
              <p class="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p>
            {/if}

            <button
              type="submit"
              class="w-full rounded-2xl bg-pine px-4 py-3 text-sm font-medium text-white transition hover:bg-pine-hover disabled:cursor-not-allowed disabled:opacity-60"
              disabled={loading}
            >
              {loading ? "Entrando…" : "Entrar"}
            </button>
          </form>

          <p class="mt-6 text-xs leading-relaxed text-mist">
            Cuentas de prueba: <span class="text-ink">admin@empresa.com</span> / Admin1234
            · <span class="text-ink">gerente@empresa.com</span> / Gerente1234
          </p>
        </section>
      </div>
    {/if}
  </main>
</div>
