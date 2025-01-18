import mongoose from "mongoose";

const Schema = mongoose.Schema;

const PairSchema = new Schema({
  tokenAddress: String,
  details: {
    symbol: String,
    marketCap: Number,
    liquidity: Number,
    created_at: String,
    is_boosted: String
  }
}, { timestamps: true });

const Pair = mongoose.model("Pair", PairSchema);

export default Pair;