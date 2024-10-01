import React, { useEffect, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';
import { useParams, Link, useLocation } from 'react-router-dom';
import WineDetailEditForm from '../components/WineDetailEditForm';
import WineData from '../components/WineData'; // Importing your WineData component
import PeakMaturityBadge from '../components/PeakMaturityBadge';
import AgeBadge from '../components/AgeBadge';
import TastingForm from '../components/TastingNotesForm';
import ShareWineButton from '../components/ShareWineButton';
import { getWineIdFromToken } from '../components/utils/getWineIdFromToken';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import ForSaleLabel from '../components/ForSaleLabel'; // Import the ForSaleLabel component


import SellWine from '../components/SellWine';
import ReactGA from 'react-ga4';
import {
    Box,
    Button,
    Typography,
    CircularProgress,
    Snackbar,
    IconButton,
    Grid,
    Card,
    CardContent,
    CardActions,
    useMediaQuery,
    useTheme
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import WineMap from '../components/WineMap';

const ForSale = () => {
    const { id: wineId, token } = useParams();
    const [user, setUser] = useState(null);
    const [wine, setWine] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isEditing, setIsEditing] = useState(false);
    const [tastingStarted, setTastingStarted] = useState(false);
    const [formData, setFormData] = useState({});
    const [successMessage, setSuccessMessage] = useState('');
    const [snackbarOpen, setSnackbarOpen] = useState(false);
    const location = useLocation();
    const [showSellWine, setShowSellWine] = useState(true);
    const [isTasting, setIsTasting] = useState(false);
    
    const handleTastingToggle = () => {
        setIsTasting(!isTasting);
    };

    const handleTastingStarted = (updatedWine) => {
        setWine(updatedWine);
        setTastingStarted(true);
    };


    const backendURL = 'https://wine-scanner-44824993784.europe-west1.run.app';
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

    useEffect(() => {
        const auth = getAuth();
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    useEffect(() => {
        if (wine) {
            ReactGA.send({
                hitType: 'pageview',
                page: `/cellar/wine-detail`,
                title: `Wine Detail - ${wine.name} (${wine.vintage})`,
            });
        }
    }, [wine, location]);

    useEffect(() => {
        const fetchWineData = async () => {
            const resolvedWineId = token ? await getWineIdFromToken(token) : wineId;

            if (user && resolvedWineId) {
                try {
                    const authToken = await user.getIdToken();
                    const response = await fetch(`${backendURL}/get-wine-data?id=${resolvedWineId}`, {
                        headers: {
                            'Authorization': `Bearer ${authToken}`,
                        },
                    });

                    if (response.ok) {
                        const result = await response.json();
                        setWine(result.wine);
                        setFormData(result.wine);
                    } else {
                        setError('Error fetching wine data');
                    }
                } catch (error) {
                    setError('An error occurred while fetching wine data');
                } finally {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
        };

        fetchWineData();
    }, [wineId, user, token]);

    const handleEditToggle = () => {
        setIsEditing(!isEditing);
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = await user.getIdToken();
            const response = await fetch(`${backendURL}/update-wine-data`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: wineId, wineData: formData }),
            });

            if (response.ok) {
                const updatedWine = await response.json();
                setWine(updatedWine.data);
                setIsEditing(false);
                setSuccessMessage('Wine details saved successfully!');
                setSnackbarOpen(true);
            } else {
                setError('Error updating wine data');
            }
        } catch (error) {
            setError('An error occurred while updating wine data');
        }
    };

    const handleSnackbarClose = () => {
        setSnackbarOpen(false);
    };
    const handleSellSuccess = () => {
        setShowSellWine(false); // Hide the SellWine component after successful selling
        window.location.reload(); // Refresh the page to fetch updated data
    };

    if (loading) return <CircularProgress />;
    if (error) return <Typography color="error">{error}</Typography>;

    return (
        <Box sx={{ padding: 0, maxWidth: 1200, margin: '0 auto' }}>
            <Box display="flex" justifyContent="flex-start" alignItems="center" sx={{ mt: 2 }}>
                <Link to="/cellar" style={{ textDecoration: 'none' }}>
                    <Button
                        variant="text"
                        color="text.primary"
                        startIcon={<ArrowBackIcon />}
                        sx={{
                            textTransform: 'none',
                            fontWeight: 'bold',
                            '&:hover': {
                                backgroundColor: 'primary.light',
                                textDecoration: 'underline',
                            }
                        }}
                    >
                        Back to Cellar
                    </Button>
                </Link>
            </Box>

            {wine ? (
                <>
                    <Typography variant="h4" component="h1" color="text.primary" sx={{ textAlign: 'left', m: 2 }}>
                        {wine.name} ({wine.vintage})
                    </Typography>

                    {isMobile ? (
                        // Mobile Layout
                        <Grid container spacing={2}>
                            <Grid item xs={12}>
                                {/* <Card sx={{ backgroundColor: '#F5F5F5', 
                                            padding: 0, 
                                            borderRadius:0, 
                                            margin:1,
                                            marginBottom:0,
                                            boxShadow:0
                                            }}> */}
                                <CardContent sx={{ p: 2 }}>
                                    {wine.images && (
                                        <Box sx={{ position: 'relative' }}>
                                            <Swiper
                                                modules={[Navigation, Pagination]}
                                                spaceBetween={10}
                                                slidesPerView={1}
                                                navigation
                                                pagination={{ clickable: true }}
                                                style={{
                                                    "--swiper-pagination-color": "#8b3a3a",
                                                    "--swiper-pagination-bullet-inactive-color": "#fff",
                                                    "--swiper-pagination-bullet-inactive-opacity": "1",
                                                    "--swiper-navigation-color": "#fff",
                                                }}
                                            >
                                                {wine.images.front?.mobile && (
                                                    <SwiperSlide>
                                                        <img
                                                            src={wine.images.front.mobile}
                                                            alt={`${wine.name} front image`}
                                                            style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                        />
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            left={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}
                                                        >
                                                            {!wine.drinkingWindow ? (
                                                                <AgeBadge vintage={wine.vintage} round={true} />
                                                            ) : (
                                                                <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                            )}
                                                        </Box>
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            right={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}>
                                                            {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                        </Box>
                                                    </SwiperSlide>
                                                )}
                                                {wine.images.back?.mobile && (
                                                    <SwiperSlide>
                                                        <img
                                                            src={wine.images.back.mobile}
                                                            alt={`${wine.name} back image`}
                                                            style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                        />
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            left={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}
                                                        >
                                                            {!wine.drinkingWindow ? (
                                                                <AgeBadge vintage={wine.vintage} round={true} />
                                                            ) : (
                                                                <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                            )}
                                                        </Box>
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            right={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}>
                                                            {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                        </Box>
                                                    </SwiperSlide>
                                                )}
                                            </Swiper>
                                        </Box>
                                    )}
                                </CardContent>
                                {/* </Card> */}
                            </Grid>

                            <Grid item xs={12} >
                                <Box sx={{
                                    padding: 2
                                }}>
                                    {isEditing ? (
                                        <WineDetailEditForm
                                            formData={formData}
                                            handleChange={handleChange}
                                            handleSubmit={handleSubmit}
                                            handleEditToggle={handleEditToggle}
                                        />
                                    ) : (
                                        <Card>
                                            <CardContent sx={{ p: 2 }}>
                                                {showSellWine && (<WineData wine={wine} wineDetailPage={true} />)}
                                            </CardContent>
                                            <CardActions sx={{ display: 'flex', gap: 1, margin: 0, padding: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleEditToggle}
                                                    sx={{ mt: 0 }}
                                                >
                                                    Edit Wine Details
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleTastingStarted}
                                                    sx={{ mt: 0 }}
                                                >
                                                    Start Tasting
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => setShowSellWine(!showSellWine)}
                                                    sx={{ mt: 0 }}
                                                >
                                                    {showSellWine ? 'Cancel Selling' : 'Sell This Wine'}
                                                </Button>

                                            </CardActions>
                                            <CardActions sx={{ display: 'flex', gap: 1, margin: 0, padding: 1 }}>
                                                <ShareWineButton wineName={wine.name} wineId={wineId} />
                                            </CardActions>
                                        </Card>
                                    )}
                                </Box>
                                <Box>

                                    {isTasting && (
                                        <TastingForm
                                            formData={formData}
                                            handleChange={handleChange}
                                            handleSubmit={handleSubmit} // You may want a specific submit handler for the tasting
                                            handleTastingToggle={handleTastingToggle}
                                        />
                                    )
                                    }
                                </Box>
                            </Grid>
                        </Grid>
                    ) : (
                        // Desktop Layout
                        <Grid container spacing={2}>
                            <Grid item xs={12} md={4} >
                                {/* <Card> */}
                                <CardContent sx={{ m: 0, p: 0 }}>
                                    {wine.images && (
                                        <Box sx={{ position: 'relative' }}>
                                            <Swiper
                                                modules={[Navigation, Pagination]}
                                                spaceBetween={10}
                                                slidesPerView={1}
                                                navigation
                                                pagination={{ clickable: true }}
                                                style={{
                                                    "--swiper-pagination-color": "#8b3a3a",
                                                    "--swiper-pagination-bullet-inactive-color": "#fff",
                                                    "--swiper-pagination-bullet-inactive-opacity": "1",
                                                    "--swiper-navigation-color": "#fff"
                                                }}
                                            >
                                                {wine.images.front?.desktop && (
                                                    <SwiperSlide>
                                                        <img
                                                            src={wine.images.front.desktop}
                                                            alt={`${wine.name} front image`}
                                                            style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                        />
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            left={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}
                                                        >
                                                            {!wine.drinkingWindow ? (
                                                                <AgeBadge vintage={wine.vintage} round={true} />
                                                            ) : (
                                                                <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                            )}
                                                        </Box>
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            right={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}>
                                                            {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                        </Box>
                                                    </SwiperSlide>

                                                )}
                                                {wine.images.back?.desktop && (
                                                    <SwiperSlide>
                                                        <img
                                                            src={wine.images.back.desktop}
                                                            alt={`${wine.name} back image`}
                                                            style={{ width: '100%', borderRadius: '0px', display: 'block' }}
                                                        />
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            left={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}
                                                        >
                                                            {!wine.drinkingWindow ? (
                                                                <AgeBadge vintage={wine.vintage} round={true} />
                                                            ) : (
                                                                <PeakMaturityBadge vintage={wine.vintage} peakMaturity={wine.peakMaturity} drinkingWindow={wine.drinkingWindow} round={true} />
                                                            )}
                                                        </Box>
                                                        <Box
                                                            position="absolute"
                                                            bottom={20} // Adjust this value to position the badge vertically
                                                            right={10} // Adjust this value to position the badge horizontally
                                                            zIndex={1} // Ensure the badge appears above the image
                                                            sx={{ padding: 0 }}>
                                                            {wine.status==="for_sale" &&( <ForSaleLabel price={wine.price} /> )}
                                                        </Box>
                                                    </SwiperSlide>
                                                )}
                                            </Swiper>
                                        </Box>
                                    )}
                                </CardContent>
                                {/* </Card> */}
                            </Grid>

                            <Grid item xs={12} md={8}>
                                <Box>
                                    {isEditing ? (
                                        <WineDetailEditForm
                                            formData={formData}
                                            handleChange={handleChange}
                                            handleSubmit={handleSubmit}
                                            handleEditToggle={handleEditToggle}
                                        />
                                    ) : (
                                        <Card>
                                            <CardContent sx={{ p: 2 }}>
                                            {!showSellWine && (<WineData wine={wine} wineDetailPage={true} />)}
                                                {showSellWine && <Card sx={{mt:1}}><SellWine wine={wine} wineId={wineId} onSuccess={handleSellSuccess}/></Card>}
                                            </CardContent>
                                            <CardActions sx={{ display: 'flex', gap: 1, padding: 1 }}>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleEditToggle}
                                                    sx={{ mt: 0 }}
                                                >
                                                    Edit Wine Details
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={handleTastingToggle}
                                                    sx={{ mt: 0 }}
                                                >
                                                    Start Tasting
                                                </Button>
                                                <Button
                                                    variant="contained"
                                                    color="primary"
                                                    onClick={() => setShowSellWine(!showSellWine)}
                                                >
                                                    {showSellWine ? 'Cancel Selling' : 'Sell This Wine'}
                                                </Button>
                                                <ShareWineButton wineName={wine.name} wineId={wineId} />
                                            </CardActions>
                                        </Card>
                                    )}
                                </Box>
                            </Grid>
                            <Box>

                                {isTasting && (
                                    <TastingForm
                                        formData={formData}
                                        handleChange={handleChange}
                                        handleSubmit={handleSubmit} // You may want a specific submit handler for the tasting
                                        handleTastingToggle={handleTastingToggle}
                                    />
                                )
                                }
                            </Box>

                        </Grid>
                    )}
                </>
            ) : (
                <Typography variant="h5">No wine details found.</Typography>
            )}

            <Snackbar
                open={snackbarOpen}
                autoHideDuration={6000}
                onClose={handleSnackbarClose}
                message={successMessage}
                action={
                    <IconButton size="small" aria-label="close" color="inherit" onClick={handleSnackbarClose}>
                        <CloseIcon fontSize="small" />
                    </IconButton>
                }
            />
            {/* {wine && (
            <Box sx={{ alignItems: "center", marginTop: 2, padding: 1 }}>
                <WineMap region={wine.region} />
            </Box>
            )} */}
        </Box>
    );
};

export default ForSale;
