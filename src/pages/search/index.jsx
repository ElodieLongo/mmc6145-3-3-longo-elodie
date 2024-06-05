import BookPreview from "../../components/bookPreview";
import { useState, useRef, useEffect } from 'react';
import styles from './style.module.css';

export default function Search() {
  const [bookSearchResults, setBookSearchResults] = useState([]);
  const [query, setQuery] = useState("React");
  const [previousQuery, setPreviousQuery] = useState();
  const [fetching, setFetching] = useState(false);

  useEffect(() => {
    async function getBookSearchResults() {
      setFetching(true);
      try {
        const res = await fetch(`https://www.googleapis.com/books/v1/volumes?langRestrict=en&maxResults=16&q=React`);
        if (!res.ok) {
          throw new Error('Error fetching data');
        }
        const data = await res.json();
        setBookSearchResults(data.items || []);
      } catch (error) {
        console.error("Error fetching data:", error);
        setBookSearchResults([]);
      } finally {
        setFetching(false);
      }
    }
    getBookSearchResults();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (fetching || query === previousQuery) return;
    setFetching(true);
    try {
      const res = await fetch(`https://www.googleapis.com/books/v1/volumes?langRestrict=en&maxResults=16&q=${query}`);
      if (!res.ok) {
        throw new Error('Error fetching data');
      }
      const data = await res.json();
      setBookSearchResults(data.items || []);
      setPreviousQuery(query);
    } catch (error) {
      console.error("Error fetching data:", error);
      setBookSearchResults([]);
    } finally {
      setFetching(false);
    }
  }

  const inputRef = useRef();
  const inputDivRef = useRef();

  return (
    <main className={styles.search}>
      <h1>Book Search</h1>

      <form className={styles.form} onSubmit={handleSubmit}>
        <label htmlFor="book-search">Search by author, title, and/or keywords:</label>
        <div ref={inputDivRef}>
          <input
            ref={inputRef}
            type="text"
            name="book-search"
            id="book-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <button type="submit">Submit</button>
        </div>
      </form>
      {
        fetching
          ? <Loading />
          : bookSearchResults.length
            ? <div className={styles.bookList}>
                {bookSearchResults.map((book, index) => (
                  <BookPreview
                    key={`${book.id}-${index}`}
                    title={book.volumeInfo?.title}
                    authors={Array.isArray(book.volumeInfo?.authors) ? book.volumeInfo.authors : (book.volumeInfo?.authors || ["Unknown Author"])}
                    thumbnail={book.volumeInfo?.imageLinks?.thumbnail}
                    previewLink={book.volumeInfo?.previewLink}
                  />
                ))}
              </div>
            : <NoResults
                {...{inputRef, inputDivRef, previousQuery}}
                clearSearch={() => setQuery("")}
              />
      }
    </main>
  )
}

function Loading() {
  return <span className={styles.loading}>Loading...⌛</span>
}

function NoResults({ inputDivRef, inputRef, previousQuery, clearSearch }) {
  function handleLetsSearchClick() {
    inputRef.current.focus();
    if (previousQuery) clearSearch();
    if (inputDivRef.current.classList.contains(styles.starBounce)) return;
    inputDivRef.current.classList.add(styles.starBounce);
    inputDivRef.current.onanimationend = function () {
      inputDivRef.current.classList.remove(styles.starBounce);
    }
  }
  return (
    <div className={styles.noResults}>
      <p><strong>{previousQuery ? `No Books Found for "${previousQuery}"` : "Nothing to see here yet. 👻👀"}</strong></p>
      <button onClick={handleLetsSearchClick}>
        {previousQuery ? `Search again?` : `Let's find a book! 🔍`}
      </button>
    </div>
  )
}
