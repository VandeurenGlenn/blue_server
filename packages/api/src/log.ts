let silent = false
export default {
	silence() {
		silent = true
	},

	print(input: any) {
		if (silent) {
			return
		}
		console.log(input)
	}
}
