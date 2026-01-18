// miinformacion.js - Conectar la lógica TypeScript con el DOM

// Instancia del componente
let miinformacion;

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function () {
  // Crear instancia del componente
  miinformacion = new MiInformacionComponent();

  // Cargar datos en el DOM
  actualizarVista();

  // Configurar listeners para inputs de contraseña
  configurarPasswordListeners();

  // Configurar listener para preview de imagen
  configurarImagenPreview();
});

function actualizarVista() {
  if (!miinformacion) return;

  const data = miinformacion.medicoData;

  // Actualizar imagen de perfil
  const profileImage = document.getElementById('profileImage');
  if (profileImage) {
    profileImage.src = data.imagenPerfil || '/assets/images/default-avatar.png';
  }

  // Actualizar información del header
  document.getElementById('nombreCompleto').textContent = data.nombreCompleto || 'Usuario';
  document.getElementById('rolBadge').textContent = data.rol || 'Médico';

  // Calcular y mostrar edad
  const edad = miinformacion.calcularEdad();
  document.getElementById(
    'edadInfo'
  ).innerHTML = `<i class="fas fa-birthday-cake"></i> ${edad} años`;

  // Mostrar fecha de registro
  const memberSince = miinformacion.today.toLocaleDateString('es-ES', {
    month: 'long',
    year: 'numeric',
  });
  document.getElementById('memberSince').textContent = memberSince;

  // Actualizar campos del formulario
  document.getElementById('cedula').value = data.cedula || '';
  document.getElementById('primerNombre').value = data.primerNombre || '';
  document.getElementById('segundoNombre').value = data.segundoNombre || '';
  document.getElementById('primerApellido').value = data.primerApellido || '';
  document.getElementById('segundoApellido').value = data.segundoApellido || '';
  document.getElementById('correo').value = data.correo || '';
  document.getElementById('telefono').value = data.telefono || '';
  document.getElementById('fechaNacimiento').value = data.fechaNacimiento || '';

  // Actualizar información del sistema
  document.getElementById('rolSistema').textContent = data.rol || 'Médico';
  document.getElementById('especialidad').textContent =
    data.especialidad || 'Pediatría - Lactancia';
}

// Sobrescribir el método toggleEditMode para actualizar el DOM
MiInformacionComponent.prototype.toggleEditMode = function () {
  if (this.editMode) {
    this.cancelarEdicion();
    return;
  }

  this.editMode = true;
  this.errores = {};
  this.editandoImagen = false;

  // Actualizar UI
  const btnEdit = document.getElementById('btnEdit');
  btnEdit.innerHTML = '<i class="fas fa-times"></i> Cancelar Edición';
  btnEdit.style.background = '#6c757d';

  // Mostrar botón de cambiar foto
  const btnChangePhoto = document.getElementById('btnChangePhoto');
  if (btnChangePhoto) {
    btnChangePhoto.style.display = 'flex';
  }

  // Habilitar campos
  document.getElementById('primerNombre').disabled = false;
  document.getElementById('segundoNombre').disabled = false;
  document.getElementById('primerApellido').disabled = false;
  document.getElementById('segundoApellido').disabled = false;
  document.getElementById('correo').disabled = false;
  document.getElementById('telefono').disabled = false;
  document.getElementById('fechaNacimiento').disabled = false;

  // Mostrar footer con botones
  document.getElementById('perfilFooter').style.display = 'flex';
  document.getElementById('infoAdicional').style.display = 'none';

  console.log('📝 Modo edición activado');
};

// Sobrescribir cancelarEdicion
MiInformacionComponent.prototype.cancelarEdicion = function () {
  this.medicoData = { ...this.originalData };
  this.editMode = false;
  this.editandoImagen = false;
  this.errores = {};

  // Actualizar UI
  const btnEdit = document.getElementById('btnEdit');
  btnEdit.innerHTML = '<i class="fas fa-edit"></i> Editar Perfil';
  btnEdit.style.background = 'rgba(255, 255, 255, 0.2)';

  // Ocultar botón de cambiar foto
  const btnChangePhoto = document.getElementById('btnChangePhoto');
  if (btnChangePhoto) {
    btnChangePhoto.style.display = 'none';
  }

  // Deshabilitar campos
  document.getElementById('primerNombre').disabled = true;
  document.getElementById('segundoNombre').disabled = true;
  document.getElementById('primerApellido').disabled = true;
  document.getElementById('segundoApellido').disabled = true;
  document.getElementById('correo').disabled = true;
  document.getElementById('telefono').disabled = true;
  document.getElementById('fechaNacimiento').disabled = true;

  // Ocultar editor de imagen
  document.getElementById('imagenEditor').style.display = 'none';

  // Ocultar footer, mostrar info adicional
  document.getElementById('perfilFooter').style.display = 'none';
  document.getElementById('infoAdicional').style.display = 'block';

  // Limpiar errores
  document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('.form-input').forEach((el) => el.classList.remove('error'));

  // Recargar vista
  actualizarVista();

  console.log('❌ Edición cancelada');
};

// Sobrescribir habilitarEdicionImagen
MiInformacionComponent.prototype.habilitarEdicionImagen = function () {
  if (!this.editMode) {
    alert('ℹ️ Activa el modo edición para cambiar la foto');
    return;
  }

  this.editandoImagen = true;
  document.getElementById('imagenEditor').style.display = 'block';
  document.getElementById('imagenLink').value = this.medicoData.imagenPerfil || '';
  document.getElementById('previewImage').src =
    this.medicoData.imagenPerfil || '/assets/images/default-avatar.png';
};

// Sobrescribir cancelarEdicionImagen
MiInformacionComponent.prototype.cancelarEdicionImagen = function () {
  this.editandoImagen = false;
  document.getElementById('imagenEditor').style.display = 'none';
  this.medicoData.imagenPerfil = this.originalData.imagenPerfil;
};

// Sobrescribir aplicarLinkImagen
MiInformacionComponent.prototype.aplicarLinkImagen = function () {
  const link = document.getElementById('imagenLink').value;

  if (!link || link.trim() === '') {
    this.medicoData.imagenPerfil = '/assets/images/default-avatar.png';
  } else {
    this.medicoData.imagenPerfil = link;
  }

  this.editandoImagen = false;
  document.getElementById('imagenEditor').style.display = 'none';
  document.getElementById('profileImage').src = this.medicoData.imagenPerfil;

  alert('✅ Link de imagen actualizado. Guarda los cambios para aplicar.');
};

// Sobrescribir togglePasswordChange
MiInformacionComponent.prototype.togglePasswordChange = function () {
  this.showPasswordChange = !this.showPasswordChange;

  const passwordSection = document.getElementById('passwordSection');

  if (this.showPasswordChange) {
    passwordSection.style.display = 'block';
    this.passwordChangeData = {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    };
    // Limpiar campos
    document.getElementById('currentPassword').value = '';
    document.getElementById('newPassword').value = '';
    document.getElementById('confirmPassword').value = '';
    document.getElementById('strengthContainer').style.display = 'none';
    document.getElementById('matchMessage').textContent = '';
  } else {
    passwordSection.style.display = 'none';
  }
};

// Sobrescribir guardarCambios para actualizar desde el DOM
MiInformacionComponent.prototype.guardarCambios = function () {
  // Leer valores del DOM
  this.medicoData.primerNombre = document.getElementById('primerNombre').value;
  this.medicoData.segundoNombre = document.getElementById('segundoNombre').value;
  this.medicoData.primerApellido = document.getElementById('primerApellido').value;
  this.medicoData.segundoApellido = document.getElementById('segundoApellido').value;
  this.medicoData.correo = document.getElementById('correo').value;
  this.medicoData.telefono = document.getElementById('telefono').value;
  this.medicoData.fechaNacimiento = document.getElementById('fechaNacimiento').value;

  if (!this.validarDatos()) {
    // Mostrar errores en el DOM
    for (const campo in this.errores) {
      const errorElement = document.getElementById(
        'error' + campo.charAt(0).toUpperCase() + campo.slice(1)
      );
      const inputElement = document.getElementById(campo);

      if (errorElement) {
        errorElement.textContent = this.errores[campo];
      }
      if (inputElement) {
        inputElement.classList.add('error');
      }
    }
    return;
  }

  this.loading = true;
  this.errores = {};

  // Limpiar errores visuales
  document.querySelectorAll('.error-message').forEach((el) => (el.textContent = ''));
  document.querySelectorAll('.form-input').forEach((el) => el.classList.remove('error'));

  console.log('💾 Guardando cambios para médico ID:', this.medicoData.id);

  const datosActualizados = {
    cedula: this.medicoData.cedula,
    imagenPerfil: this.medicoData.imagenPerfil || null,
    primerNombre: this.medicoData.primerNombre,
    segundoNombre: this.medicoData.segundoNombre || '',
    primerApellido: this.medicoData.primerApellido,
    segundoApellido: this.medicoData.segundoApellido || '',
    correo: this.medicoData.correo,
    telefono: this.medicoData.telefono,
    fechaNacimiento: this.medicoData.fechaNacimiento,
  };

  // Simular guardado
  setTimeout(() => {
    this.medicoData.nombreCompleto = this.construirNombreCompleto();

    // Actualizar localStorage
    const savedUser = JSON.parse(localStorage.getItem('lactaCareUser') || '{}');
    Object.assign(savedUser, datosActualizados);
    savedUser.nombre_completo = this.medicoData.nombreCompleto;
    localStorage.setItem('lactaCareUser', JSON.stringify(savedUser));

    this.originalData = { ...this.medicoData };
    this.editMode = false;
    this.editandoImagen = false;
    this.loading = false;

    // Actualizar UI
    actualizarVista();
    this.cancelarEdicion();

    console.log('✅ Datos actualizados correctamente');
    alert('✅ Datos actualizados correctamente');
  }, 1000);
};

// Configurar listeners para validación de contraseña
function configurarPasswordListeners() {
  const newPassword = document.getElementById('newPassword');
  const confirmPassword = document.getElementById('confirmPassword');

  if (newPassword) {
    newPassword.addEventListener('input', function () {
      const password = this.value;

      if (password.length > 0) {
        document.getElementById('strengthContainer').style.display = 'block';

        const strength = miinformacion.getPasswordStrength(password);
        const fill = document.getElementById('strengthFill');
        const text = document.getElementById('strengthText');

        fill.style.width = strength.width;
        fill.className = 'password-strength-fill ' + strength.class;
        text.textContent = strength.text;

        // Actualizar requisitos
        updateRequirement('length', password.length >= 8);
        updateRequirement('upper', miinformacion.hasUpperCase(password));
        updateRequirement('lower', miinformacion.hasLowerCase(password));
        updateRequirement('number', miinformacion.hasNumber(password));
        updateRequirement(
          'special',
          !miinformacion.hasSpecialChars(password) && password.length > 0
        );
      } else {
        document.getElementById('strengthContainer').style.display = 'none';
      }
    });
  }

  if (confirmPassword) {
    confirmPassword.addEventListener('input', function () {
      const newPass = document.getElementById('newPassword').value;
      const confirmPass = this.value;
      const matchMessage = document.getElementById('matchMessage');

      if (confirmPass.length > 0) {
        if (newPass === confirmPass) {
          matchMessage.innerHTML = '<i class="fas fa-check"></i> Las contraseñas coinciden';
          matchMessage.className = 'password-match-message match';
        } else {
          matchMessage.innerHTML = '<i class="fas fa-times"></i> Las contraseñas no coinciden';
          matchMessage.className = 'password-match-message no-match';
        }
      } else {
        matchMessage.textContent = '';
        matchMessage.className = 'password-match-message';
      }
    });
  }
}

function updateRequirement(id, isValid) {
  const element = document.getElementById('req-' + id);
  if (element) {
    if (isValid) {
      element.classList.add('valid');
      element.querySelector('i').className = 'fas fa-check';
    } else {
      element.classList.remove('valid');
      element.querySelector('i').className = 'fas fa-times';
    }
  }
}

// Configurar preview de imagen en tiempo real
function configurarImagenPreview() {
  const imagenLink = document.getElementById('imagenLink');

  if (imagenLink) {
    imagenLink.addEventListener('input', function () {
      const previewImage = document.getElementById('previewImage');
      if (this.value && this.value.trim() !== '') {
        previewImage.src = this.value;
      } else {
        previewImage.src = '/assets/images/default-avatar.png';
      }
    });
  }
}
