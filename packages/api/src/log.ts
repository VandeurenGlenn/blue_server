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
	},
	time(input: string) {
		if (silent) {
			return
		}
		console.time(input)
	},
	timeEnd(input: string) {
		if (silent) {
			return
		}
		console.timeEnd(input)
	}
}
