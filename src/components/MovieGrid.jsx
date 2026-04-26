import MovieCard from './MovieCard';

const MovieGrid = ({ movies }) => {
  return (
    <div className="grid grid-cols-4 md:grid-cols-4 lg:grid-cols-5 gap-3 md:gap-8">
      {movies.map((movie) => (
        <MovieCard key={movie.id} movie={movie} />
      ))}
    </div>
  );
};

export default MovieGrid;
