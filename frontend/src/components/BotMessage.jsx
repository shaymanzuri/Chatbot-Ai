import React from 'react';
import  { useState, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Typography from '@mui/material/Typography';

import Button from '@mui/material/Button';

// eslint-disable-next-line react/prop-types

const BotMessage = ({ fetchMessage}) =>{
  const [isLoading, setLoading] = useState(true);
  const [message, setMessage] = useState("");
  const [open, setOpen] = React.useState(false);
  const [description,setDescription] = useState("")
  const [nItems, setNItems] = useState(parseInt(sessionStorage.getItem('NItems')) || 0);
  const [qte,setQte] = useState(1)
  const [items, setItems] = useState([]);
  const priceRegex = /₪[0-9]+(?:\.[0-9]{1,2})?/; // Regular expression to match a price in NIS
  const priceRegex2 = /NIS [0-9]+(?:\.[0-9]{1,2})?/; // Regular expression to match a price in NIS

  // const priceRegex2 = /₪[0-9]+(?:\.[0-9]{1,2})?/;
  const handleClickOpen = (line) => {
    setOpen(true);
    setDescription(line)
    
  };
  const handleClose = () => {
    setOpen(false);
  };
  const addQte = () => {
    setQte(qte +1)
  }
  const ReduceQte = () => {
    setQte(qte -1)
  }
  const addItem = (d,p) => {
   

    const storedItems = sessionStorage.getItem('Items');
    
    if (storedItems) {
        const parsedItems = JSON.parse(storedItems);
        setItems(parsedItems);
        const newItem = {Description:d ,Price:p,Quantity:qte}
        setNItems(nItems +1 );
        
        const updatedItems = [...parsedItems, newItem];
        setItems(updatedItems);
       
        sessionStorage.setItem('Items', JSON.stringify(updatedItems));
        sessionStorage.setItem("NItems",nItems +1 )
        window.dispatchEvent(new Event('storageUpdate'));

     
    }

    setQte(1)
    handleClose()
  };

  const removeItem = () => {
    if (numItems > 0) {
      setNumItems(numItems - 1);
    }
  };
  useEffect(() => {
    async function loadMessage() {
      const msg = await fetchMessage();
      setLoading(false);
      setMessage(msg);
    }
    loadMessage();

  }, [fetchMessage]);

  useEffect(() => {
    const handleStorageChange = () => {
      setNItems(parseInt(sessionStorage.getItem('NItems')));
      setItems(JSON.parse(sessionStorage.getItem("Items")))
     
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('storageUpdate', handleStorageChange); // Listen for custom event
    // return () => {
    //   window.removeEventListener('storage', handleStorageChange);
    //   window.removeEventListener('storageUpdate', handleStorageChange);
      

    // };
  }, []);
  return (
    <div>
    
    <div className="message-container">
      <div className="bot-message">{isLoading ? "..." : message.split("\n").map((line,index)=>(
        <div key={index}>
        <p  style={{textAlign:"justify"}}>{line.replace(/<\/?st>/g, '').replace(/<\/?en>/g, '')} <br /> <span style={{textAlign:"justify"}}> {(( line.match(priceRegex) || line.match(priceRegex2)) && line.match(/<st>\s*(.*?)\s*<en>/) ) ? 
                      <a onClick={()=>{
                        handleClickOpen(line)
                      }} style={{textDecoration:"underline",cursor:"pointer",color:"white"}}>Buy now</a> 
          :<p></p>}</span>  </p>

<Dialog
            
            onClose={handleClose}
            aria-labelledby="customized-dialog-title"
            open={open}
          >
            <DialogTitle sx={{ m: 0, p: 2 }} id="customized-dialog-title">
              Add to Cart
            </DialogTitle>
            <IconButton
              aria-label="close"
              onClick={handleClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
            <DialogContent dividers>
              <div style={{display:"flex",flexDirection:"row",justifyContent:"space-evenly",alignItems:"start"}}>
                <img src="it_icon.png" width={200} />
                <div>
                  <p>Description: <br/> {description.match(/<st>\s*(.*?)\s*<en>/)?description.match(/<st>\s*(.*?)\s*<en>/)[1]:""}</p>
                  <p>Price : {description.match(priceRegex) ? description.match(priceRegex)[0] : description.match(priceRegex2) ? description.match(priceRegex2)[0] : ''}</p>
                  <h5>Quantity :  <span><Button sx={{mt:"25px"}} variant="outlined" onClick={()=>{ ReduceQte()}}>-</Button></span>{qte} <span><Button sx={{mt:"25px"}} variant="outlined" onClick={()=>{ addQte()}}>+</Button></span></h5>
                  
                    
                    
        {((description.match(priceRegex) || description.match(priceRegex2)) && description.match(/<st>\s*(.*?)\s*<en>/)) &&      <Button sx={{mt:"25px"}} variant="outlined" onClick={()=>{
                    addItem(description.match(/<st>\s*(.*?)\s*<en>/)?description.match(/<st>\s*(.*?)\s*<en>/)[1]:"",description.match(priceRegex) ? description.match(priceRegex)[0] : description.match(priceRegex2) ? description.match(priceRegex2)[0] : '') }}>

                  
        Add to Cart
      </Button>
      }
                </div>
              </div>
            </DialogContent>
          </Dialog>
        <div>
   
    
  </div>
        
      </div>

      ))}</div>
    </div>
   
  </div>
  );
}



export default BotMessage