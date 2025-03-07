import React, { useState, useEffect, useRef, useCallback } from "react";
import { Box, Typography, CircularProgress, Link } from "@mui/material";

interface NewsArticle {
  title: string;
  description: string;
  url: string;
  source: string;
  published_at: string;
}

const NewsFeed = () => {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(true);

  const observer = useRef<IntersectionObserver | null>(null);
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  const loadArticles = useCallback(async (pageNum: number) => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`http://localhost:9000/api/news?page=${pageNum}`);
      if (!response.ok) throw new Error('Failed to fetch articles');
      const data = await response.json();
      
      setArticles(prev => [...prev, ...data]);
      setHasMore(data.length > 0);
      setPage(prev => prev + 1);
    } catch (err) {
      setError('Failed to load articles. Scroll to retry.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    observer.current = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadArticles(page);
        }
      },
      { threshold: 1.0 }
    );

    if (sentinelRef.current) observer.current.observe(sentinelRef.current);

    return () => observer.current?.disconnect();
  }, [hasMore, loading, loadArticles, page]);

  useEffect(() => {
    loadArticles(1);
  }, []);

  return (
    <Box
      sx={{
        width: "100%",
        height: "535px",
        overflowY: "auto",
        backgroundColor: "#2d2d34",
        border: "1px solid #404040",
        borderRadius: "8px",
        padding: "10px",
        '&::-webkit-scrollbar': {
          display: 'none'
        }
      }}
    >
      <Typography 
        variant="h5" 
        sx={{ 
          color: "#8884d8", 
          textAlign: "center", 
          mb: 2,
          fontWeight: "bold",
          textTransform: "uppercase",
          letterSpacing: "1px"
        }}
      >
        Financial News
      </Typography>

      {articles.map((article, index) => (
        <Box
          key={index}
          sx={{
            bgcolor: "#1e1e1e",
            borderRadius: "8px",
            p: 2,
            mb: 1.5,
            color: "white",
            border: "1px solid #404040",
            '&:hover': {
              borderColor: "#8884d8",
              boxShadow: "0 0 8px rgba(136, 132, 216, 0.2)"
            }
          }}
        >
          <Typography variant="h6" sx={{ mb: 1 }}>
            <Link
              href={article.url}
              target="_blank"
              rel="noopener"
              color="inherit"
              underline="hover"
              sx={{
                '&:hover': {
                  color: "#8884d8",
                  textDecoration: "underline"
                }
              }}
            >
              {article.title}
            </Link>
          </Typography>
          <Typography variant="body2" sx={{ color: "#ddd", mb: 1, fontSize: "0.875rem" }}>
            {article.description}
          </Typography>
          <Box sx={{ 
            display: "flex", 
            justifyContent: "space-between", 
            color: "#aaa",
            fontSize: "0.75rem",
            mt: 1
          }}>
            <Typography variant="caption">{article.source}</Typography>
            <Typography variant="caption">
              {new Date(article.published_at).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'short',
                day: 'numeric'
              })}
            </Typography>
          </Box>
        </Box>
      ))}

      <div ref={sentinelRef} style={{ height: "20px" }} />

      {loading && (
        <Box sx={{ display: "flex", justifyContent: "center", p: 2 }}>
          <CircularProgress size={24} sx={{ color: "#8884d8" }} />
        </Box>
      )}

      {error && (
        <Typography 
          sx={{ 
            color: "#ff4444", 
            textAlign: "center", 
            p: 2,
            fontSize: "0.875rem"
          }}
        >
          {error}
        </Typography>
      )}

      {!hasMore && !loading && (
        <Typography 
          sx={{ 
            color: "#8884d8", 
            textAlign: "center", 
            p: 2,
            fontSize: "0.875rem"
          }}
        >
          No more articles to load
        </Typography>
      )}
    </Box>
  );
};

export default NewsFeed;
