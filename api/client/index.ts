
const top100 = async () => {
  const response = await fetch('https://blue.leofcoin.org/top-100')
  return response.json()
}

export default {
  top100
}