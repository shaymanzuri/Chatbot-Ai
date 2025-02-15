import React, { useState, useEffect } from 'react';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import {
  Modal,
  Box,
  Button,
  TextField,
  Typography,
  MenuItem,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper
} from '@mui/material';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import axios from 'axios';

const Cart = () => {
  const [nItems, setNItems] = useState(
    parseInt(sessionStorage.getItem('NItems')) || 0
  );
  const [items, setItems] = useState(
    JSON.parse(sessionStorage.getItem('Items')) || []
  );
  const [modalIsOpen, setModalIsOpen] = useState(false);
  const [totalPrice, setTotalPrice] = useState(0);
  const openModal = () => {
    setModalIsOpen(true);
    let price = 0;
    for (let i = 0; i < items.length; i++) {
      price =
        price +
        parseInt(items[i]['Price'].replace(/₪|NIS/g, '').trim()) *
          parseInt(items[i]['Quantity']);
      // console.log(price)
    }
    setTotalPrice(price);
  };
  useEffect(() => {
    const priceRegex = /₪[0-9]+(?:\.[0-9]{1,2})?/; // Regular expression to match a price in NIS
    const priceRegex2 = /NIS [0-9]+(?:\.[0-9]{1,2})?/;
    let price = 0;
    for (let i = 0; i < items.length; i++) {
      price =
        price +
        parseInt(items[i]['Price'].replace(/₪|NIS/g, '').trim()) *
          parseInt(items[i]['Quantity']);
      // console.log(price)
    }
    setTotalPrice(price);
    const handleStorageChange = () => {
      setNItems(parseInt(sessionStorage.getItem('NItems')));
      setItems(JSON.parse(sessionStorage.getItem('Items')));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange); // Listen for custom event
    // return () => {
    //   window.removeEventListener('storage', handleStorageChange);
    //   window.removeEventListener('storageUpdate', handleStorageChange);

    // };
  }, []);

  return (
    <div className="cart-container">
      <div className="cart-icon">
        <span className="cart-count">{sessionStorage.getItem('NItems')}</span>
        <ShoppingCartIcon onClick={openModal} />
        {/* Replace with your cart icon */}
      </div>
      {/* <div className="cart-actions">
        <button onClick={addItem}>Add Item</button>
        <button onClick={removeItem} disabled={items === 0}>Remove Item</button>
      </div> */}
      <CheckoutModal
        modalIsOpen={modalIsOpen}
        nItems={nItems}
        setNItems={setNItems}
        setModalIsOpen={setModalIsOpen}
        items={items}
        setItems={setItems}
        totalPrice={totalPrice}
        setTotalPrice={setTotalPrice}
      />
    </div>
  );
};

const CheckoutModal = ({
  modalIsOpen,
  setModalIsOpen,
  items,
  nItems,
  setItems,
  setNItems,
  totalPrice,
  setTotalPrice
}) => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');

  const handleGeneratePDF = async e => {
    e.preventDefault(); // Prevent the default form submission behavior

    const doc = new jsPDF();
    doc.text('Checkout Details', 10, 10);
    doc.text(`Name: ${name}`, 10, 20);
    doc.text(`Email: ${email}`, 10, 30);
    doc.text(`Address: ${address}`, 10, 40);
    doc.text(`Payment Method: ${paymentMethod}`, 10, 50);

    doc.autoTable({
      startY: 60,
      head: [['No', 'Description', 'Unit-Price in NIS', 'Quantity']],
      body: items.map((product, index) => [
        index,
        product.Description,
        `NIS ${product.Price.replace(/₪|NIS/g, '')}`,
        product.Quantity
      ])
    });
    const finalY = doc.lastAutoTable.finalY + 10; // Get the Y coordinate after the table
    doc.text(`Total Price: NIS ${totalPrice}`, 10, finalY);
    if (items) {
      console.log(items);
      try {
        // ${import.meta.env.VITE_API_URL}

        const res = await axios.post(
          `${import.meta.env.VITE_API_URL}/update_quantity`,
          {
            items: items
          }
        );
        if (res.data.message == 'Quantity updated successfully') {
          setItems([]);
          setNItems(0);
          sessionStorage.setItem('Items', JSON.stringify([]));
          sessionStorage.setItem('NItems', 0);

          doc.save('checkout.pdf');
          window.dispatchEvent(new Event('storageUpdate'));
        } else {
          alert(res.data.message);
        }
      } catch (err) {
        console.log('Here ');
        alert(err);
      }
    } else {
      alert('No Item found');
    }
    closeModal();
  };

  const openModal = () => {
    const priceRegex = /₪[0-9]+(?:\.[0-9]{1,2})?/; // Regular expression to match a price in NIS
    const priceRegex2 = /NIS [0-9]+(?:\.[0-9]{1,2})?/;

    setTotalPrice(price);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
  };

  useEffect(() => {
    const priceRegex = /₪[0-9]+(?:\.[0-9]{1,2})?/; // Regular expression to match a price in NIS
    const priceRegex2 = /NIS [0-9]+(?:\.[0-9]{1,2})?/;
    let price = 0;
    for (let i = 0; i < items.length; i++) {
      price =
        price +
        parseInt(items[i]['Price'].replace(/₪|NIS/g, '').trim()) *
          parseInt(items[i]['Quantity']);
    }
    console.log(price);
    setTotalPrice(price);
    const handleStorageChange = () => {
      setNItems(parseInt(sessionStorage.getItem('NItems')));
      setItems(JSON.parse(sessionStorage.getItem('Items')));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange); // Listen for custom event
    // return () => {
    //   window.removeEventListener('storage', handleStorageChange);
    //   window.removeEventListener('storageUpdate', handleStorageChange);

    // };
  }, []);

  const removeItem = index => {
    const updatedItems = JSON.parse(sessionStorage.getItem('Items')).filter(
      (_, i) => i !== index
    );
    setItems(updatedItems);
    setNItems(nItems - 1);

    const priceRegex = /₪[0-9]+(?:\.[0-9]{1,2})?/; // Regular expression to match a price in NIS
    const priceRegex2 = /NIS [0-9]+(?:\.[0-9]{1,2})?/;
    let price = 0;
    for (let i = 0; i < items.length; i++) {
      price =
        price +
        parseInt(items[i]['Price'].replace(/₪|NIS/g, '').trim()) *
          parseInt(items[i]['Quantity']);
      console.log(price);
    }
    setTotalPrice(price);
    sessionStorage.setItem('Items', JSON.stringify(updatedItems));
    sessionStorage.setItem('NItems', nItems - 1);
    window.dispatchEvent(new Event('storageUpdate'));
    closeModal();
  };
  return (
    <div>
      <Modal
        open={modalIsOpen}
        onClose={closeModal}
        aria-labelledby="modal-title"
        aria-describedby="modal-description"
      >
        <Box sx={customStyles}>
          <Typography id="modal-title" variant="h6" component="h2">
            Checkout Page
          </Typography>
          <Box component="form" sx={{ mt: 2 }}>
            <TextField
              fullWidth
              label="Name"
              margin="normal"
              value={name}
              onChange={e => setName(e.target.value)}
            />
            <TextField
              fullWidth
              label="Email"
              type="email"
              margin="normal"
              value={email}
              onChange={e => setEmail(e.target.value)}
            />
            <TextField
              fullWidth
              label="Address"
              margin="normal"
              value={address}
              onChange={e => setAddress(e.target.value)}
            />
            <TextField
              fullWidth
              select
              label="Payment Method"
              margin="normal"
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
            >
              <MenuItem value="credit-card">Credit Card</MenuItem>
              <MenuItem value="paypal">PayPal</MenuItem>
            </TextField>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ mt: 2 }}
              onClick={handleGeneratePDF}
            >
              Submit
            </Button>
            <Button
              onClick={closeModal}
              variant="outlined"
              color="secondary"
              sx={{ mt: 2, ml: 2 }}
            >
              Close
            </Button>
          </Box>
          <Box sx={{ mt: 2 }}>
            <Typography id="modal-description" sx={{ mt: 2 }}>
              Products in your cart:
            </Typography>
            <TableContainer component={Paper} sx={{ mt: 2 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>No</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Unit-Price</TableCell>
                    <TableCell>Quantity</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {items.map((product, index) => (
                    <TableRow key={index}>
                      <TableCell>{index}</TableCell>
                      <TableCell>{product.Description}</TableCell>
                      <TableCell>{product.Price}</TableCell>
                      <TableCell>{product.Quantity}</TableCell>
                      <TableCell>
                        <Button
                          sx={{ mt: '25px' }}
                          variant="outlined"
                          onClick={() => {
                            removeItem(index);
                          }}
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
                {items.length != 0 && (
                  <TableRow sx={{ mt: 2, textAlign: 'right' }}>
                    <TableCell style={{ textAlign: 'right' }}>
                      <b style={{ fontSize: '20px' }}>
                        Total Price: ₪{totalPrice}
                      </b>{' '}
                    </TableCell>
                  </TableRow>
                )}
              </Table>
            </TableContainer>
          </Box>
        </Box>
      </Modal>
    </div>
  );
};

export default function Header() {
  return (
    <div className="header">
      &nbsp;Tech Store Chatbot
      <Cart />
    </div>
  );
}
const customStyles = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  height: '80vh',
  width: '70vw',
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
  overflowY: 'scroll ',
  borderRadius: '10px'
};
