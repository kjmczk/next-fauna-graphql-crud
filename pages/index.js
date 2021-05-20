import Link from 'next/link';
import useSWR from 'swr';
import { gql } from 'graphql-request';
import Layout from '../components/layout';
import styles from '../styles/Home.module.css';
import { graphQLClient } from '../utils/graphql-client';

const fetcher = async (query) => await graphQLClient.request(query);

const Home = () => {
  const { data, error, mutate } = useSWR(
    gql`
      {
        allTodos {
          data {
            _id
            task
            completed
          }
        }
      }
    `,
    fetcher
  );

  const toggleTodo = async (id, completed) => {
    const query = gql`
      mutation PartialUpdateTodo($id: ID!, $completed: Boolean!) {
        partialUpdateTodo(id: $id, data: { completed: $completed }) {
          _id
          completed
        }
      }
    `;

    const variables = {
      id,
      completed: !completed,
    };

    try {
      await graphQLClient.request(query, variables);
      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  const deleteATodo = async (id) => {
    const query = gql`
      mutation DeleteATodo($id: ID!) {
        deleteTodo(id: $id) {
          _id
        }
      }
    `;

    try {
      await graphQLClient.request(query, { id });
      mutate();
    } catch (error) {
      console.error(error);
    }
  };

  if (error) return <div>failed to load</div>;

  return (
    <Layout>
      <h1>Next Fauna GraphQL CRUD</h1>

      <Link href="/new">
        <a>Create New Todo</a>
      </Link>

      {data ? (
        <ul>
          {data.allTodos.data.map((todo) => (
            <li key={todo._id} className={styles.todo}>
              <span
                onClick={() => toggleTodo(todo._id, todo.completed)}
                style={
                  todo.completed
                    ? { textDecorationLine: 'line-through' }
                    : { textDecorationLine: 'none' }
                }
              >
                {todo.task}
              </span>
              <span className={styles.edit}>
                <Link href={`/todo/${todo._id}`}>
                  <a>Edit</a>
                </Link>
              </span>
              <span
                onClick={() => deleteATodo(todo._id)}
                className={styles.delete}
              >
                Delete
              </span>
            </li>
          ))}
        </ul>
      ) : (
        <div>loading...</div>
      )}
    </Layout>
  );
};

export default Home;
