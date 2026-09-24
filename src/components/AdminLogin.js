import React, { useState } from 'react';
import { Login } from '../icons';
import { supabase } from '../supabaseClient';
import translations from '../translations';

const AdminLogin = ({ language, onToast, checkAuth }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const t = translations[language];

  return (
    <div className="container">
      <div className="page-header">
        <div>
          <h1>{t.adminTitle}</h1>
        </div>
        <div className="page-actions">
        </div>
      </div>
      <div className="admin-login">
        <h2>{t.adminLogin}</h2>
        <div className="admin-login-form">
          <input
            type="email"
            placeholder={t.email}
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder={t.password}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault();
                (async () => {
                  const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password
                  });
                  if (error) onToast(error.message, 'error');
                  else checkAuth();
                })();
              }
            }}
          />
          <button type="button" className="btn-primary" onClick={async () => {
            const { error } = await supabase.auth.signInWithPassword({
              email: email,
              password: password
            });
            if (error) onToast(error.message, 'error');
            else checkAuth();
          }}>
            <Login size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
