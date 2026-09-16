const Auth = {
  guardar({ token, usuario }) {
    localStorage.setItem('taller_token', token);
    localStorage.setItem('taller_usuario', JSON.stringify(usuario));
  },
  token() {
    return localStorage.getItem('taller_token');
  },
  usuario() {
    const raw = localStorage.getItem('taller_usuario');
    return raw ? JSON.parse(raw) : null;
  },
  rol() {
    const usuario = this.usuario();
    return usuario ? usuario.rol : null;
  },
  puede(...roles) {
    return roles.includes(this.rol());
  },
  salir() {
    localStorage.removeItem('taller_token');
    localStorage.removeItem('taller_usuario');
    location.href = 'index.html';
  },
};
