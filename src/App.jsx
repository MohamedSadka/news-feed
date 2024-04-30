import { Button, Container, Typography, styled } from "@mui/material";
import NewsHeader from "./components/NewsHeader";
import NewsFeed from "./components/NewsFeed";
import { useEffect, useRef, useState } from "react";
import { debounce } from "lodash";

const PAGE_SIZE = 5;

function App() {
  const [articles, setArticles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [category, setCategory] = useState("general");
  const pageNumber = useRef(1);
  const queryValue = useRef("");

  const Footer = styled("div")(({ theme }) => ({
    padding: theme.spacing(2, 0),
    display: "flex",
    justifyContent: "space-between",
  }));

  async function loadData(currentCategory) {
    const response = await fetch(
      `https://newsapi.org/v2/top-headlines?category=${currentCategory}&
      q=${queryValue.current}&page=${pageNumber.current}&country=eg&
      pageSize=${PAGE_SIZE}&apiKey=${import.meta.env.VITE_NEWS_API_KEY}`
    );
    const data = await response.json();
    if (data.status === "error") {
      throw new Error("An error has occurred");
    }
    return data.articles.map((article) => {
      const { title, author, description, urlToImage, publishedAt, url } =
        article;
      return {
        url,
        title,
        author,
        description,
        image: urlToImage,
        publishedAt,
      };
    });
  }

  const fetchAndUpdateArticles = (currentCategory) => {
    setLoading(true);
    setError("");
    loadData(currentCategory ?? category)
      .then((newData) => {
        setArticles(newData);
      })
      .catch((errorMessage) => {
        setError(errorMessage.message);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const debouncedApiCalls = debounce(fetchAndUpdateArticles, 500);

  useEffect(() => {
    fetchAndUpdateArticles();
  }, []);

  const handleSeachChange = (newQuery) => {
    pageNumber.current = 1;
    queryValue.current = newQuery;
    debouncedApiCalls();
  };

  const handlePrevClick = () => {
    pageNumber.current -= 1;
    fetchAndUpdateArticles();
  };

  const handleNextClick = () => {
    pageNumber.current += 1;
    fetchAndUpdateArticles();
  };

  const handleCategoryChange = (event) => {
    setCategory(event.target.value);
    pageNumber.current = 1;
    fetchAndUpdateArticles(event.target.value);
  };

  return (
    <Container>
      <NewsHeader
        onSeachChange={handleSeachChange}
        category={category}
        onCategoryChange={handleCategoryChange}
      />
      {error.length === 0 ? (
        <NewsFeed articles={articles} loading={loading} />
      ) : (
        <Typography color="error" align="center">
          {error}
        </Typography>
      )}
      <Footer>
        <Button
          variant="outlined"
          onClick={handlePrevClick}
          disabled={loading || pageNumber.current === 1}
        >
          Previous
        </Button>
        <Button
          variant="outlined"
          onClick={handleNextClick}
          disabled={loading || articles.length < PAGE_SIZE}
        >
          Next
        </Button>
      </Footer>
    </Container>
  );
}

export default App;
