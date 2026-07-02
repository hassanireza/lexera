import random
import string


def build_quiz_questions(words, mode='quiz'):
    """Build MCQ (mode='quiz') or typing-recall (mode='typing') questions from a word list."""
    all_defs = [w.definition for w in words]
    questions = []
    for w in words:
        if mode == 'typing':
            questions.append({
                'word_id': w.id,
                'prompt': w.definition,
                'answer': w.text.lower(),
                'hint': f"{len(w.text)} letters",
            })
        else:
            distractors = [d for d in all_defs if d != w.definition]
            random.shuffle(distractors)
            choices = distractors[:3] + [w.definition]
            random.shuffle(choices)
            questions.append({
                'word_id': w.id,
                'prompt': f"What does \u201c{w.text}\u201d mean?",
                'choices': choices,
                'answer': w.definition,
            })
    random.shuffle(questions)
    return questions


def build_connections(words):
    """Pair each word with a synonym if it has one in the DB, else with its own definition
    (shortened) as a fallback so every lesson works even with sparse synonym data."""
    pairs = []
    for w in words:
        syn = w.synonyms.first()
        if syn:
            pairs.append({'left': w.text, 'right': syn.text, 'kind': 'synonym'})
        else:
            short_def = w.definition if len(w.definition) < 40 else w.definition[:37] + '…'
            pairs.append({'left': w.text, 'right': short_def, 'kind': 'meaning'})
    return pairs


def build_dragdrop(words):
    items = [{'word': w.text, 'definition': w.definition} for w in words]
    return items


# ---------------- Sudoku (word edition) ----------------

def _solve_sudoku(grid):
    """Backtracking solver/generator working on a 9x9 grid of ints 0-9 (0=empty)."""
    for r in range(9):
        for c in range(9):
            if grid[r][c] == 0:
                nums = list(range(1, 10))
                random.shuffle(nums)
                for n in nums:
                    if _valid(grid, r, c, n):
                        grid[r][c] = n
                        if _solve_sudoku(grid):
                            return True
                        grid[r][c] = 0
                return False
    return True


def _valid(grid, r, c, n):
    if n in grid[r]:
        return False
    if n in [grid[i][c] for i in range(9)]:
        return False
    br, bc = 3 * (r // 3), 3 * (c // 3)
    for i in range(br, br + 3):
        for j in range(bc, bc + 3):
            if grid[i][j] == n:
                return False
    return True


def generate_sudoku(letters, difficulty='easy'):
    """letters: exactly 9 unique uppercase letters. Returns (puzzle, solution) as 9x9 grids of letters ('' for blank)."""
    letters = list(dict.fromkeys(letters))[:9]
    while len(letters) < 9:
        letters.append(random.choice(string.ascii_uppercase))

    grid = [[0] * 9 for _ in range(9)]
    _solve_sudoku(grid)
    solution = [[letters[grid[r][c] - 1] for c in range(9)] for r in range(9)]

    holes = {'easy': 30, 'medium': 42, 'hard': 52}.get(difficulty, 30)
    puzzle = [row[:] for row in solution]
    cells = [(r, c) for r in range(9) for c in range(9)]
    random.shuffle(cells)
    for r, c in cells[:holes]:
        puzzle[r][c] = ''

    return puzzle, solution, letters
