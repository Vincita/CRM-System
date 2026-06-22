import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useLogin, useRegister } from '../../hooks/useAuth';
import './login.css';

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loginMutation = useLogin();
  const registerMutation = useRegister();

  // Kiểm tra nếu đã đăng nhập thì chuyển thẳng vào dashboard
  useEffect(() => {
    if (user) {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError(null);
    setSuccessMsg(null);
    setUsername('');
    setPassword('');
    setName('');
    setConfirmPassword('');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    loginMutation.mutate(
      { username, password },
      {
        onSuccess: (response) => {
          const userData = response.data.data;
          login(userData, remember);
          setSuccessMsg('Đăng nhập thành công! Đang chuyển hướng...');
          setTimeout(() => {
            navigate('/dashboard');
          }, 800);
        },
        onError: (error: any) => {
          const msg = error.response?.data?.message || 'Đăng nhập thất bại';
          setError(msg);
        },
      }
    );
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (!name || !username || !password) {
      setError('Vui lòng nhập đầy đủ họ tên, tài khoản và mật khẩu');
      return;
    }
    if (password !== confirmPassword) {
      setError('Mật khẩu xác nhận không khớp');
      return;
    }
    if (password.length < 4) {
      setError('Mật khẩu phải có ít nhất 4 ký tự');
      return;
    }

    registerMutation.mutate(
      { name, username, password },
      {
        onSuccess: () => {
          setSuccessMsg('Đăng ký thành công! Vui lòng đăng nhập.');
          setName('');
          setUsername('');
          setPassword('');
          setConfirmPassword('');
          setTimeout(() => {
            setMode('login');
            setSuccessMsg(null);
          }, 1500);
        },
        onError: (error: any) => {
          const msg = error.response?.data?.message || 'Đăng ký thất bại';
          setError(msg);
        },
      }
    );
  };

  return (
    <div className="login-page">
      <div className="login-card">
        {/* Brand */}
        <div className="login-brand">
          <span className="brand-icon">🏢</span>
          <h1>CRM System</h1>
          <p>Customer Relationship Management</p>
        </div>

        {/* Welcome */}
        <div className="login-welcome">
          <h2>Chào mừng trở lại!</h2>
          <p>{mode === 'login' ? 'Đăng nhập để tiếp tục sử dụng hệ thống' : 'Tạo tài khoản mới'}</p>
        </div>

        {/* Alerts */}
        {error && (
          <div className="alert alert-error">
            <span className="alert-icon">⚠️</span>
            <span>{error}</span>
          </div>
        )}
        {successMsg && (
          <div className="alert alert-success">
            <span className="alert-icon">✅</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Form */}
        <form className="login-form" onSubmit={mode === 'login' ? handleLogin : handleRegister}>
          {mode === 'register' && (
            <div className="input-group">
              <label htmlFor="name">Họ và tên</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input
                  type="text"
                  id="name"
                  placeholder="Nhập họ tên..."
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label htmlFor="username">Tài khoản</label>
            <div className="input-wrapper">
              <span className="input-icon">📧</span>
              <input
                type="text"
                id="username"
                placeholder="Nhập tài khoản..."
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label htmlFor="password">Mật khẩu</label>
            <div className="input-wrapper">
              <span className="input-icon">🔒</span>
              <input
                type="password"
                id="password"
                placeholder="Nhập mật khẩu..."
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          {mode === 'register' && (
            <div className="input-group">
              <label htmlFor="confirmPassword">Xác nhận mật khẩu</label>
              <div className="input-wrapper">
                <span className="input-icon">✓</span>
                <input
                  type="password"
                  id="confirmPassword"
                  placeholder="Nhập lại mật khẩu..."
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          {mode === 'login' && (
            <div className="forgot-link">
              <a href="#" onClick={(e) => { e.preventDefault(); alert('Chức năng đang phát triển'); }}>Quên mật khẩu?</a>
            </div>
          )}

          {mode === 'login' && (
            <div className="login-options">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                />
                <span>Ghi nhớ đăng nhập</span>
              </label>
            </div>
          )}

          <button
            type="submit"
            className="btn-login"
            disabled={loginMutation.isPending || registerMutation.isPending}
          >
            {loginMutation.isPending || registerMutation.isPending ? (
              <span className="spinner"></span>
            ) : mode === 'login' ? (
              <>Đăng nhập →</>
            ) : (
              <>Đăng ký →</>
            )}
          </button>

          <div className="login-divider">
            <span>Hoặc</span>
          </div>

          <div className="switch-mode">
            <p>
              {mode === 'login' ? (
                <>Chưa có tài khoản? <button type="button" className="link-button" onClick={switchMode}>Đăng ký ngay</button></>
              ) : (
                <>Đã có tài khoản? <button type="button" className="link-button" onClick={switchMode}>Đăng nhập</button></>
              )}
            </p>
          </div>
        </form>

        {/* Footer */}
        <div className="login-footer">
          <p className="slogan">Quản lý khách hàng hiệu quả, nâng tầm doanh nghiệp</p>
          <p className="version">CRM Dashboard v2.0</p>
        </div>
      </div>
    </div>
  );
};

export default Login;