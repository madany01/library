'use strict'

class Book {
	static booksCounter = 0

	constructor(title, author, numPages, isRead) {
		this.id = Book.booksCounter++
		this.title = title
		this.author = author
		this.numPages = Number(numPages)
		this.isRead = Boolean(isRead)
	}

	toggleReadStatus() {
		this.isRead = !this.isRead
		return this
	}

	info() {
		return `${this.title}, ${this.author}, ${this.numPages}, ${this.isRead ? 'read' : 'not read yet'}`
	}
}


const modalOverlay = document.querySelector('.modal-overlay')
const modalCtr = document.querySelector('.modal-ctr')
const modalConfirmBtn = modalCtr.querySelector('.confirm')

const table = document.querySelector('table')

const collapseBtn = document.querySelector('.collapse-btn')
const form = document.querySelector('form')


const books = new Map()




function addInitialBooks() {
	const booksData = [
		{
			title: 'Do Androids Dream of Electric Sheep',
			author: 'Philip K. Dick',
			numPages: 1200,
			isRead: true,
		},
		{
			title: 'Everything I Never Told You',
			author: 'Celeste Ng',
			numPages: 900,
			isRead: false,
		},
		{
			title: 'Is Everyone Hanging Out Without Me? (and Other Concerns)',
			author: 'Mindy Kaling',
			numPages: 700,
			isRead: false,
		},
		{
			title: 'Are You There, Vodka? It’s Me, Chelsea ',
			author: 'Chelsea Handler',
			numPages: 800,
			isRead: true,
		},
	]
	booksData.forEach(bookData => {
		renderBook(addBookToLibrary(bookData))
	})
}


function addBookToLibrary(bookData) {
	const book = new Book(
		bookData.title,
		bookData.author,
		bookData.numPages,
		bookData.isRead,
	)

	books.set(book.id, book)

	return book
}


function renderBook(book) {
	table.tBodies[0].insertAdjacentHTML('beforeend', `
		<tr data-book-id="${book.id}">
		<td>${book.title} </td>
		<td>${book.author} </td>
		<td>${book.numPages}</td>
		${book.isRead ?
			`<td><button class="toggle-read read">✔</button></td>` :
			`<td><button class="toggle-read">✖</button></td>`
		}
		<td>
			<button class="remove-book">
				<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash"
					viewBox="0 0 16 16">
					<path
						d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z" />
					<path fill-rule="evenodd"
						d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z" />
				</svg>
			</button>
		</td>
		</tr>
`)
}


function deleteBook(book) {
	books.delete(book.id)
	table.querySelector(`tr[data-book-id="${book.id}"]`).remove()
}


function setValidationMassage(e) {
	const input = e.target
	const fieldName = e.target.dataset.fieldName
	
	if(input.validity.valueMissing) input.setCustomValidity(`${fieldName} field is required`)
	else if(input.validity.tooShort) input.setCustomValidity(`too short ${fieldName} length, must be in range [${input.minLength},${input.maxLength}]`)
	else if(input.validity.tooLong) input.setCustomValidity(`too long ${fieldName} length, must be in range [${input.minLength},${input.maxLength}]`)
	else if(input.validity.rangeUnderflow) input.setCustomValidity(`too small ${fieldName} value, must in the range [${input.min}, ${input.max}]`)
	else if(input.validity.rangeOverflow) input.setCustomValidity(`too big ${fieldName} value, must in the range [${input.min}, ${input.max}]`)
	else if(input.validity.patternMismatch) input.setCustomValidity(`invalid ${fieldName} format`)
}

function validateForm() {
	;[...form.querySelectorAll('input')].filter(input => input.willValidate).forEach(i => i.setCustomValidity(''))
	return form.reportValidity()
}





function hideModal() {
	modalCtr.book = null
	modalCtr.classList.toggle('d-none')
	modalOverlay.classList.toggle('d-none')
}


function showModal(book) {
	modalCtr.book = book
	modalCtr.querySelector('.item-name').textContent = book.title
	modalCtr.style.top = `${window.scrollY}px`
	modalCtr.classList.toggle('d-none')
	modalOverlay.classList.toggle('d-none')
}

// ... event listeners ...


// collapse
collapseBtn.addEventListener('click', e => e.target.classList.toggle('open'))

// modals
modalOverlay.addEventListener('click', hideModal)

modalCtr.querySelectorAll('.close-icon, button.cancel').forEach(clickable => {
	clickable.addEventListener('click', hideModal)
})

modalConfirmBtn.addEventListener('click', e => {
	deleteBook(modalCtr.book)
	hideModal()
})

form.addEventListener('submit', e => {
	e.preventDefault()
	if(!validateForm()) return
	
	const bookData = Object.fromEntries(new FormData(e.target))
	const book = addBookToLibrary(bookData)

	renderBook(book)

	e.target.querySelectorAll('input').forEach(input => {
		if (input.type === 'checkbox') input.checked = false
		else input.value = ''
	})

	collapseBtn.click()
})

// toggle/remove book
table.addEventListener('click', e => {
	const target = e.target

	const bookElt = target.closest('tr')

	if (!bookElt) return

	const toggleReadBtn = target.closest('.toggle-read')
	const deleteBookBtn = target.closest('.remove-book')

	if (!toggleReadBtn && !deleteBookBtn) return


	const book = books.get(Number(bookElt.dataset.bookId))

	if (toggleReadBtn) {
		book.toggleReadStatus()
		toggleReadBtn.classList.toggle('read')
		toggleReadBtn.textContent = book.isRead ? '✔' : '✖'
		return
	}

	if (deleteBookBtn) {
		showModal(book)
		return
	}

})

;[...form.querySelectorAll('input')]
	.filter(input => input.willValidate)
	.forEach(input => {
		input.addEventListener('invalid', setValidationMassage)
		input.addEventListener('input', e => {
			e.target.setCustomValidity('')
		})
	})

addInitialBooks()
