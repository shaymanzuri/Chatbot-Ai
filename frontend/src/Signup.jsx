import { useState } from 'react';
import styles from './styles/signup.module.css';
import axios from 'axios';
import { Link, useNavigate } from 'react-router-dom';
import userStore from './userStore';
export default function Signup() {
  const { username, changeUsername } = userStore();
  const navigate = useNavigate();
  const [user, setUser] = useState({
    username: '',
    password: '',
    gender: 'Male',
    location: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const createAccount = async e => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/signup`,
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
        alert(
          'Failed to create account check that all informations well filled !!! '
        );
      }
    } catch (err) {
      alert('An error occured while creating account try again !!!');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form className={styles.main} onSubmit={e => createAccount(e)}>
      <div className={styles.submain}>
        <h2>Create Accout</h2>
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
        <div className={styles.input_wrapper}>
          <label htmlFor="gender">Gender</label>
          <select
            id="gender"
            required
            value={user.gender}
            onChange={e => setUser({ ...user, gender: e.target.value })}
          >
            <option>Male</option>
            <option>Female</option>
          </select>
        </div>
        <div className={styles.input_wrapper}>
          <label htmlFor="location">Location</label>
          <input
            id="location"
            type="text"
            required
            value={user.location}
            onChange={e => setUser({ ...user, location: e.target.value })}
          />
        </div>
        {!isLoading ? (
          <button type="submit" className={styles.btn}>
            Create Account
          </button>
        ) : (
          <button type="submit" className={styles.btn1} disabled>
            Processing ...
          </button>
        )}
        <Link className={styles.link} to={'/login'}>
          Login now ?
        </Link>
      </div>
    </form>
  );
}
