import { useState } from 'react';
import styles from './styles/signup.module.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import userStore from './userStore';
export default function Login() {
  const { username, changeUsername } = userStore;
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    password: ''
  });
  const [isLoading, setIsLoading] = useState(false);
  // ${import.meta.env.VITE_API_URL}
  const createAccount = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/login`,
        user
      );
      if (res.data.success) {
        sessionStorage.setItem('username', JSON.stringify(res.data.username));

        sessionStorage.setItem(
          'logged_chat_user',
          JSON.stringify(res.data.data)
        );
        navigate('/');
      } else {
        alert('Wrong username or password !!!');
      }
    } catch (err) {
      console.log(err);
      alert('An error occured while login to account try again !!!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.main} onSubmit={e => createAccount(e)}>
      <div className={styles.submain}>
        <h2>Login To Accout</h2>
        <div className={styles.input_wrapper}>
          <label htmlFor="username">Username</label>
          <input
            id="username"
            value={user.username}
            onChange={e => setUser({ ...user, username: e.target.value })}
            type="text"
            placeholder="Enter username ..."
            required
          />
        </div>
        <div className={styles.input_wrapper}>
          <label htmlFor="password">Password</label>
          <input
            value={user.password}
            onChange={e => setUser({ ...user, password: e.target.value })}
            id="password"
            type="password"
            required
          />
        </div>

        {!isLoading ? (
          <button type="submit" className={styles.btn}>
            Login now
          </button>
        ) : (
          <button type="submit" className={styles.btn1} disabled>
            Processing ...
          </button>
        )}
        <Link className={styles.link} to={'/signup'}>
          Create account now ?
        </Link>
      </div>
    </form>
  );
}
