import { useState } from 'react'
import logoPrincipal from '../assets/LogoPrincipal.png'
import { EyeIcon, EyeOffIcon } from '../components/icons'
import {
  AuthError,
  MIN_PASSWORD_LENGTH,
  requestPasswordReset,
  resetPassword,
  signIn,
  signUp,
} from '../services/auth'
import './LoginPage.css'

function PasswordField({ id, label, value, onChange, autoComplete, autoFocus }) {
  const [visible, setVisible] = useState(false)

  return (
    <div className="login-field">
      <label htmlFor={id}>{label}</label>
      <div className="login-password">
        <input
          id={id}
          className="login-input"
          type={visible ? 'text' : 'password'}
          value={value}
          onChange={(event) => onChange(event.target.value)}
          autoComplete={autoComplete}
          autoFocus={autoFocus}
          required
        />
        <button
          className="login-eye"
          type="button"
          aria-label={visible ? 'Ocultar senha' : 'Mostrar senha'}
          aria-pressed={visible}
          onClick={() => setVisible((current) => !current)}
        >
          {visible ? <EyeOffIcon /> : <EyeIcon />}
        </button>
      </div>
    </div>
  )
}

// O link do e-mail de redefinição volta para esta página com ?token=... (ou ?error=... se venceu).
function readResetLink() {
  const params = new URLSearchParams(window.location.search)
  return { token: params.get('token') || '', failed: Boolean(params.get('error')) }
}

function clearResetLink() {
  window.history.replaceState(null, '', window.location.pathname)
}

export function LoginPage({ onAuthenticated }) {
  const [resetLink] = useState(readResetLink)
  const [view, setView] = useState(resetLink.token ? 'reset' : 'login')
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(false)
  const [error, setError] = useState(resetLink.failed ? 'Este link venceu ou já foi usado. Peça um novo.' : '')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState(false)

  function goTo(nextView, nextNotice = '') {
    setView(nextView)
    setPassword('')
    setError('')
    setNotice(nextNotice)
  }

  async function run(action) {
    setBusy(true)
    setError('')
    setNotice('')

    try {
      await action()
    } catch (caught) {
      setError(
        caught instanceof AuthError ? caught.message : 'Algo deu errado. Tente novamente.',
      )
    } finally {
      setBusy(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    if (busy) return

    if (view === 'login') {
      run(async () => onAuthenticated(await signIn({ email, password, remember })))
    } else if (view === 'signup') {
      run(async () => {
        const user = await signUp({ name, email, password })
        if (user) onAuthenticated(user)
        else goTo('login', 'Conta criada. Confirme o e-mail que enviamos e depois entre.')
      })
    } else if (view === 'forgot') {
      run(async () => {
        await requestPasswordReset(email)
        // A resposta é a mesma exista ou não a conta, para não revelar quem tem cadastro.
        goTo('login', 'Se houver uma conta com esse e-mail, enviamos um link para redefinir a senha.')
      })
    } else {
      run(async () => {
        await resetPassword({ token: resetLink.token, password })
        clearResetLink()
        goTo('login', 'Senha redefinida. Entre com a nova senha.')
      })
    }
  }

  const heading = {
    login: { title: 'Entrar', text: 'Acesse sua conta para continuar.' },
    signup: {
      title: 'Criar conta',
      text: 'Cadastre-se para começar a controlar suas finanças.',
    },
    forgot: {
      title: 'Esqueci minha senha',
      text: 'Enviaremos um link de redefinição para o seu e-mail.',
    },
    reset: { title: 'Nova senha', text: 'Defina uma nova senha para a sua conta.' },
  }[view]

  const submitLabel = {
    login: busy ? 'Entrando...' : 'Entrar',
    signup: busy ? 'Criando conta...' : 'Criar conta',
    forgot: busy ? 'Enviando...' : 'Enviar link',
    reset: busy ? 'Salvando...' : 'Redefinir senha',
  }[view]

  const showEmail = view !== 'reset'
  const showNewPassword = view === 'signup' || view === 'reset'

  return (
    <div className="login-shell">
      <div className="scene-background" aria-hidden="true">
        <div className="scene-orb orb-one" />
        <div className="scene-orb orb-two" />
        <div className="scene-orb orb-three" />
        <div className="scene-grid" />
        <div className="scene-plane plane-one" />
        <div className="scene-plane plane-two" />
      </div>

      <main className="panel login-card">
        <div className="login-brand">
          <img className="login-logo" src={logoPrincipal} alt="" />
          <strong>ORÇAFY EXPENSE</strong>
          <span>CONTROLE PESSOAL DE FINANÇAS</span>
        </div>

        <h1>{heading.title}</h1>
        {/* Erro e aviso ocupam a linha do subtítulo, para o card quadrado não mudar de altura. */}
        <p
          className={`login-subtitle ${error ? 'is-error' : notice ? 'is-success' : ''}`}
          role={error ? 'alert' : notice ? 'status' : undefined}
        >
          {error || notice || heading.text}
        </p>

        <form onSubmit={handleSubmit} noValidate>
          {view === 'signup' && (
            <div className="login-field">
              <label htmlFor="login-name">Nome</label>
              <input
                id="login-name"
                className="login-input"
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                autoComplete="name"
                autoFocus
                required
              />
            </div>
          )}

          {showEmail && (
            <div className="login-field">
              <label htmlFor="login-email">E-mail</label>
              <input
                id="login-email"
                className="login-input"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="username"
                autoFocus={view !== 'signup'}
                required
              />
            </div>
          )}

          {view === 'login' && (
            <>
              <PasswordField
                id="login-password"
                label="Senha"
                value={password}
                onChange={setPassword}
                autoComplete="current-password"
              />

              <div className="login-options">
                <label className="login-check">
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  <span>Lembrar de mim</span>
                </label>
                <button className="login-link" type="button" onClick={() => goTo('forgot')}>
                  Esqueci minha senha
                </button>
              </div>
            </>
          )}

          {showNewPassword && (
            <>
              <PasswordField
                id="login-new-password"
                label={
                  <>
                    {view === 'reset' ? 'Nova senha' : 'Senha'}{' '}
                    <small>(mínimo de {MIN_PASSWORD_LENGTH} caracteres)</small>
                  </>
                }
                value={password}
                onChange={setPassword}
                autoComplete="new-password"
                autoFocus={view === 'reset'}
              />
            </>
          )}

          <button className="pill-button pill-button-primary login-submit" type="submit" disabled={busy}>
            {submitLabel}
          </button>
        </form>

        <p className="login-switch">
          {view === 'login' && (
            <>
              Ainda não tem conta?{' '}
              <button className="login-link" type="button" onClick={() => goTo('signup')}>
                Criar conta
              </button>
            </>
          )}
          {view === 'signup' && (
            <>
              Já tem conta?{' '}
              <button className="login-link" type="button" onClick={() => goTo('login')}>
                Entrar
              </button>
            </>
          )}
          {(view === 'forgot' || view === 'reset') && (
            <button
              className="login-link"
              type="button"
              onClick={() => {
                clearResetLink()
                goTo('login')
              }}
            >
              Voltar para o login
            </button>
          )}
        </p>
      </main>
    </div>
  )
}
