const supabaseUrl = 'https://yrbqknvqnxylygzvodyf.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlyYnFrbnZxbnh5bHlnenZvZHlmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Nzc3NTkzMjEsImV4cCI6MjA5MzMzNTMyMX0.dU2EVS6soB4YN4naRn-_9W318irTaVzLCUMzowEjW_Y';
const _supabase = supabase.createClient(supabaseUrl, supabaseKey);

async function registrarUsuario(e) {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const { data, error } = await _supabase.auth.signUp({
        email: email,
        password: password,
        options: {
            data: { full_name: name }
        }
    });

    if (error) {
        alert("Error al registrar: " + error.message);
    } else {
        alert("¡Registro exitoso! Ya puedes iniciar sesión.");
        location.reload();
    }
}

async function iniciarSesion(e) {
    e.preventDefault();
    const email = document.getElementById('log-email').value;
    const password = document.getElementById('log-password').value;
    const btn = e.target.querySelector('button');

    if(btn) {
        btn.innerText = "Verificando...";
        btn.disabled = true;
    }

    try {
        // A. Autenticación en Supabase Auth
        const { data: authData, error: authError } = await _supabase.auth.signInWithPassword({
            email: email,
            password: password,
        });

        if (authError) throw authError;
        const user = authData.user;

        const { data: profile, error: profileError } = await _supabase
            .from('profiles')
            .select('admin')
            .eq('id', user.id)
            .single();

        if (profile && profile.admin === true) {
            console.log("Acceso concedido al Panel Admin");
            window.location.replace('dashboardAdmin.html');
            return; 
        }

        const { data: pro, error: proError } = await _supabase
            .from('postulaciones')
            .select('estado')
            .eq('user_id', user.id)
            .maybeSingle();

        if (pro && pro.estado && pro.estado.toLowerCase() === "verificado") {
            console.log("Acceso concedido al Dashboard Pro");
            window.location.replace('profesional.html');
        } else {
            console.log("Acceso como vecino normal");
            window.location.replace('index.html');
        }

    } catch (error) {
        alert("Error: " + error.message);
        if(btn) {
            btn.innerText = "Iniciar Sesión";
            btn.disabled = false;
        }
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const regForm = document.querySelector('#register-form form');
    const logForm = document.querySelector('#login-form form');

    if (regForm) regForm.addEventListener('submit', registrarUsuario);
    if (logForm) logForm.addEventListener('submit', iniciarSesion);
});
