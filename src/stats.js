import Gtk from 'gi://Gtk'
import Adw from 'gi://Adw'
import GObject from 'gi://GObject'
import { gettext as _ } from 'gettext'
import * as utils from './utils.js'
import * as format from './format.js'
import { listBooks, fraction } from './library.js'

class Statistics {
    getAllStats() {
        const now = new Date()
        const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).getTime()
        const weekStart = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).getTime()
        const monthStart = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000).getTime()
        const yearStart = new Date(now.getFullYear(), 0, 1).getTime()

        const todayStr = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
        const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
        const weekStartStr = `${weekAgo.getFullYear()}-${String(weekAgo.getMonth() + 1).padStart(2, '0')}-${String(weekAgo.getDate()).padStart(2, '0')}`
        const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
        const monthStartStr = `${monthAgo.getFullYear()}-${String(monthAgo.getMonth() + 1).padStart(2, '0')}-${String(monthAgo.getDate()).padStart(2, '0')}`
        const yearStartStr = `${now.getFullYear()}-01-01`

        let totalBooks = 0
        let finishedBooks = 0
        let inProgressBooks = 0
        let unreadBooks = 0
        let totalProgressSum = 0
        let progressCount = 0

        let pagesReadToday = 0
        let pagesReadThisWeek = 0
        let pagesReadThisMonth = 0
        let pagesReadThisYear = 0
        let totalPagesRead = 0

        let completedChaptersCount = 0

        let booksAddedThisWeek = 0
        let booksAddedThisMonth = 0
        let booksAddedThisYear = 0

        for (const { file, modified } of listBooks(pkg.datadir) ?? []) {
            totalBooks++
            const modTime = modified ? modified.getTime() : 0
            if (modTime >= weekStart) booksAddedThisWeek++
            if (modTime >= monthStart) booksAddedThisMonth++
            if (modTime >= yearStart) booksAddedThisYear++

            const data = utils.readJSONFile(file)
            const completedChapters = data?.completedChapters
            const hasCompletedChapters = completedChapters && typeof completedChapters === 'object' && Object.keys(completedChapters).length > 0

            const progress = data?.progress
            const rawFrac = fraction(progress)
            const frac = (hasCompletedChapters || data?.finished) ? rawFrac : 0
            const isFinished = (data?.finished !== undefined && data?.finished !== null)
                ? Boolean(data.finished)
                : (hasCompletedChapters && frac !== null && frac >= 0.95)

            if (isFinished) {
                finishedBooks++
            } else if (frac !== null && frac > 0) {
                inProgressBooks++
            } else {
                unreadBooks++
            }

            if (frac !== null) {
                totalProgressSum += frac
                progressCount++
            }

            if (hasCompletedChapters) {
                let bookLogTotal = 0
                for (const info of Object.values(completedChapters)) {
                    if (!info || !info.completed) continue
                    completedChaptersCount++
                    const pages = (typeof info.pages === 'number' && !isNaN(info.pages) && info.pages > 0) ? info.pages : 1
                    const dateStr = info.date || (info.timestamp ? new Date(info.timestamp).toISOString().slice(0, 10) : todayStr)
                    bookLogTotal += pages
                    if (dateStr === todayStr) pagesReadToday += pages
                    if (dateStr >= weekStartStr) pagesReadThisWeek += pages
                    if (dateStr >= monthStartStr) pagesReadThisMonth += pages
                    if (dateStr >= yearStartStr) pagesReadThisYear += pages
                }
                totalPagesRead += bookLogTotal
            }
        }

        const averageProgress = totalBooks > 0 ? (totalProgressSum / totalBooks) : 0

        return {
            totalBooks,
            finishedBooks,
            inProgressBooks,
            unreadBooks,
            averageProgress,
            pagesReadToday,
            pagesReadThisWeek,
            pagesReadThisMonth,
            pagesReadThisYear,
            totalPagesRead,
            completedChaptersCount,
            booksAddedThisWeek,
            booksAddedThisMonth,
            booksAddedThisYear,
        }
    }
}

export const StatisticsPage = GObject.registerClass({
    GTypeName: 'FoliateStatisticsPage',
    Template: pkg.moduleuri('ui/stats.ui'),
    InternalChildren: [
        'total-books',
        'finished-books',
        'in-progress-books',
        'completed-chapters',
        'unread-books',
        'total-pages-read',
        'average-progress',
        'books-added-this-week',
        'books-added-this-month',
        'books-added-this-year',
        'pages-read-today',
        'pages-read-this-week',
        'pages-read-this-month',
        'pages-read-this-year',
    ],
}, class extends Adw.PreferencesPage {
    #stats = new Statistics()
    
    constructor(params) {
        super(params)
        this.updateStats()
    }

    updateStats() {
        const stats = this.#stats.getAllStats()
        const fmt = n => format.number ? format.number(n) : n.toLocaleString()
        
        this._total_books.label = fmt(stats.totalBooks)
        this._finished_books.label = fmt(stats.finishedBooks)
        this._in_progress_books.label = fmt(stats.inProgressBooks)
        this._completed_chapters.label = fmt(stats.completedChaptersCount)
        this._unread_books.label = fmt(stats.unreadBooks)
        this._average_progress.label = Math.round(stats.averageProgress * 100) + '%'
        
        this._pages_read_today.label = fmt(stats.pagesReadToday)
        this._pages_read_this_week.label = fmt(stats.pagesReadThisWeek)
        this._pages_read_this_month.label = fmt(stats.pagesReadThisMonth)
        this._pages_read_this_year.label = fmt(stats.pagesReadThisYear)
        this._total_pages_read.label = fmt(stats.totalPagesRead)
        
        this._books_added_this_week.label = fmt(stats.booksAddedThisWeek)
        this._books_added_this_month.label = fmt(stats.booksAddedThisMonth)
        this._books_added_this_year.label = fmt(stats.booksAddedThisYear)
    }
})

export { Statistics }