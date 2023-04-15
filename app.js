const express = require('express');
const app = express();
const port = process.env.PORT || 3000;
const solanaWeb3 = require('@solana/web3.js');
const connection = new solanaWeb3.Connection(solanaWeb3.clusterApiUrl('devnet'));

app.use(express.static('public'));

app.get('/api/check-nft-ownership/:nftPublicKey', async (req, res) => {
  const nftPublicKey = req.params.nftPublicKey;
  const nftAccountInfo = await connection.getAccountInfo(new solanaWeb3.PublicKey(nftPublicKey));
  if (!nftAccountInfo) {
    return res.json({ error: 'NFT account not found' });
  }

  const ownerAddress = new solanaWeb3.PublicKey(nftAccountInfo.data.slice(64, 96));
  const ownerAccountInfo = await connection.getAccountInfo(ownerAddress);
  if (!ownerAccountInfo) {
    return res.json({ error: 'Owner account not found' });
  }

  const ownerPublicKeyString = ownerAddress.toBase58();
  const mintAuthorityPublicKeyString = new solanaWeb3.PublicKey(nftAccountInfo.data.slice(0, 32)).toBase58();
  const membersOnlyAreaAccess = (mintAuthorityPublicKeyString === 'AhCWXkxEiNPD2WQ7eE9pDUku6zvgZpaU5jBpAzeXpHj4' && ownerPublicKeyString === req.query.walletPublicKey);

  res.json({ isOwner: ownerPublicKeyString === req.query.walletPublicKey, membersOnlyAreaAccess });
});

app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
