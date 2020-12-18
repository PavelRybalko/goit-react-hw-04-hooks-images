import { useState, useEffect } from 'react';
import { ToastContainer } from 'react-toastify';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import Container from './components/Container';
import Searchbar from './components/Searchbar';
import ImageGallery from './components/ImageGallery';
import Loader from './components/Loader';
import Modal from './components/Modal';
import Button from './components/Button';
import pixabayApi from './services/pixabay-api';

export default function App() {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeImage, setActiveImage] = useState(null);
  const [images, setImages] = useState([]);
  const [page, setPage] = useState(1);
  const [error, setError] = useState(null);
  const [showLoader, setShowLoader] = useState(false);
  const [showButton, setShowButton] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const onChangeQuery = query => {
    setSearchQuery(query);
    setImages([]);
    setPage(1);
    setError(null);
  };

  useEffect(() => {
    const fetchImages = () => {
      const options = { searchQuery, page };

      pixabayApi
        .fetchImages(options)
        .then(res => {
          const { hits, totalHits } = res;

          if (!!hits.length) {
            toast.success('Запрос выполнен успешно');
            setImages(prevImages => [...prevImages, ...hits]);
            setShowButton(true);
          }

          if (!hits.length) {
            toast.error(`По запросу "${searchQuery}" ничего не найдено`);
          }

          if (totalHits <= 12) {
            setShowButton(false);
          }
        })
        .catch(error => setError(error))
        .finally(() => {
          setShowLoader(false);
          window.scrollTo({
            top: document.documentElement.offsetHeight,
            behavior: 'smooth',
          });
        });
    };

    searchQuery && setShowLoader(true);
    searchQuery && fetchImages();
  }, [searchQuery, page]);

  const incrementPage = () => setPage(state => state + 1);

  const openModal = ({ target }) => {
    const { largeimageurl } = target.dataset;
    const { alt } = target;

    setActiveImage({
      url: largeimageurl,
      alt: alt,
    });

    toggleModal();
  };

  const toggleModal = () => {
    setShowModal(state => !state);
  };

  return (
    <Container>
      <Searchbar onSubmit={onChangeQuery} />
      {error && <h1>{error.message}</h1>}

      {images && !error && <ImageGallery items={images} onClick={openModal} />}
      {showModal && <Modal onClose={toggleModal} activeImage={activeImage} />}

      {showLoader && <Loader />}
      {showButton && (
        <Button onClick={incrementPage} aria-label="Load More">
          Load More
        </Button>
      )}

      <ToastContainer autoClose={3000} />
    </Container>
  );
}
