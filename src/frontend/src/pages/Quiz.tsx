import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { BookMarked, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const STORAGE_KEY = "teachment_quizzes";

interface Question {
  _key: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: number;
}

interface Quiz {
  id: string;
  title: string;
  className: string;
  questions: Question[];
  createdAt: number;
}

function makeKey() {
  return `q-${Math.random().toString(36).slice(2)}`;
}

function loadQuizzes(): Quiz[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed: Quiz[] = JSON.parse(raw);
      // Ensure all questions have _key for backwards compat
      return parsed.map((quiz) => ({
        ...quiz,
        questions: quiz.questions.map((q) => ({
          ...q,
          _key: q._key ?? makeKey(),
        })),
      }));
    }
  } catch {}
  const samples: Quiz[] = [
    {
      id: "quiz-sample-1",
      title: "Algebra Basics",
      className: "Class 8A",
      questions: [
        {
          _key: "qk-1",
          text: "What is 2x + 3 = 7? Find x.",
          options: ["x = 1", "x = 2", "x = 3", "x = 4"],
          correctIndex: 1,
        },
        {
          _key: "qk-2",
          text: "Which is the formula for the area of a circle?",
          options: ["πr", "2πr", "πr²", "2πr²"],
          correctIndex: 2,
        },
      ],
      createdAt: Date.now() - 86400000,
    },
    {
      id: "quiz-sample-2",
      title: "Science Chapter 5",
      className: "Class 9B",
      questions: [
        {
          _key: "qk-3",
          text: "What is the chemical symbol for water?",
          options: ["O2", "H2O", "CO2", "NaCl"],
          correctIndex: 1,
        },
      ],
      createdAt: Date.now() - 172800000,
    },
  ];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(samples));
  return samples;
}

function saveQuizzes(quizzes: Quiz[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(quizzes));
}

const emptyQuestion = (): Question => ({
  _key: makeKey(),
  text: "",
  options: ["", "", "", ""],
  correctIndex: 0,
});

const OPTION_LABELS = ["A", "B", "C", "D"];

export default function Quiz() {
  const [quizzes, setQuizzes] = useState<Quiz[]>(loadQuizzes);
  const [title, setTitle] = useState("");
  const [className, setClassName] = useState("");
  const [questions, setQuestions] = useState<Question[]>([emptyQuestion()]);
  const [viewQuiz, setViewQuiz] = useState<Quiz | null>(null);

  const updateQuestion = (key: string, q: Partial<Question>) => {
    setQuestions((prev) =>
      prev.map((item) => (item._key === key ? { ...item, ...q } : item)),
    );
  };

  const updateOption = (key: string, oi: number, val: string) => {
    setQuestions((prev) =>
      prev.map((item) => {
        if (item._key !== key) return item;
        const opts = [...item.options] as [string, string, string, string];
        opts[oi] = val;
        return { ...item, options: opts };
      }),
    );
  };

  const handleSave = () => {
    if (!title.trim()) {
      toast.error("Please enter a quiz title.");
      return;
    }
    if (!className) {
      toast.error("Please select a class.");
      return;
    }
    for (const q of questions) {
      if (!q.text.trim()) {
        toast.error("All questions must have text.");
        return;
      }
      if (q.options.some((o) => !o.trim())) {
        toast.error("All options must be filled in.");
        return;
      }
    }
    const quiz: Quiz = {
      id: `quiz-${Date.now()}`,
      title: title.trim(),
      className,
      questions,
      createdAt: Date.now(),
    };
    const updated = [quiz, ...quizzes];
    setQuizzes(updated);
    saveQuizzes(updated);
    setTitle("");
    setClassName("");
    setQuestions([emptyQuestion()]);
    toast.success("Quiz saved!");
  };

  const handleDelete = (id: string) => {
    const updated = quizzes.filter((q) => q.id !== id);
    setQuizzes(updated);
    saveQuizzes(updated);
    toast.success("Quiz deleted.");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <BookMarked size={20} className="text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">Quiz Builder</h1>
          <p className="text-sm text-muted-foreground">
            Create and manage quizzes for your classes
          </p>
        </div>
      </div>

      {/* Builder Form */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Create New Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="quiz-title">Quiz Title</Label>
              <Input
                id="quiz-title"
                data-ocid="quiz.input"
                placeholder="e.g. Algebra Chapter 3 Test"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label>Class</Label>
              <Select value={className} onValueChange={setClassName}>
                <SelectTrigger data-ocid="quiz.select">
                  <SelectValue placeholder="Select class" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Class 8A">Class 8A</SelectItem>
                  <SelectItem value="Class 9B">Class 9B</SelectItem>
                  <SelectItem value="All Classes">All Classes</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Questions */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Questions ({questions.length})
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                data-ocid="quiz.secondary_button"
                onClick={() =>
                  setQuestions((prev) => [...prev, emptyQuestion()])
                }
              >
                <Plus size={14} className="mr-1" />
                Add Question
              </Button>
            </div>

            {questions.map((q, qi) => (
              <div
                key={q._key}
                className="border border-border rounded-xl p-4 space-y-3 bg-muted/20"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                    Q{qi + 1}
                  </span>
                  {questions.length > 1 && (
                    <Button
                      type="button"
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                      onClick={() =>
                        setQuestions((prev) =>
                          prev.filter((item) => item._key !== q._key),
                        )
                      }
                    >
                      <Trash2 size={13} />
                    </Button>
                  )}
                </div>
                <Input
                  placeholder="Question text"
                  value={q.text}
                  onChange={(e) =>
                    updateQuestion(q._key, { text: e.target.value })
                  }
                />
                <RadioGroup
                  value={String(q.correctIndex)}
                  onValueChange={(v) =>
                    updateQuestion(q._key, { correctIndex: Number(v) })
                  }
                  className="space-y-2"
                >
                  {q.options.map((opt, oi) => (
                    <div
                      key={OPTION_LABELS[oi]}
                      className="flex items-center gap-2"
                    >
                      <RadioGroupItem
                        value={String(oi)}
                        id={`${q._key}-o${oi}`}
                      />
                      <Input
                        className="h-8 text-sm"
                        placeholder={`Option ${oi + 1}${
                          q.correctIndex === oi ? " (correct)" : ""
                        }`}
                        value={opt}
                        onChange={(e) =>
                          updateOption(q._key, oi, e.target.value)
                        }
                      />
                    </div>
                  ))}
                </RadioGroup>
                <p className="text-xs text-muted-foreground">
                  Select the radio button next to the correct answer
                </p>
              </div>
            ))}
          </div>

          <Button
            className="w-full"
            data-ocid="quiz.submit_button"
            onClick={handleSave}
          >
            Save Quiz
          </Button>
        </CardContent>
      </Card>

      {/* Quizzes List */}
      <div>
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider mb-3">
          Saved Quizzes ({quizzes.length})
        </h2>

        {quizzes.length === 0 && (
          <div
            className="text-center py-12 text-muted-foreground"
            data-ocid="quiz.empty_state"
          >
            <BookMarked size={40} className="mx-auto mb-3 opacity-30" />
            <p className="text-sm">No quizzes yet. Create one above!</p>
          </div>
        )}

        <div className="space-y-3">
          {quizzes.map((quiz, idx) => (
            <Card key={quiz.id} data-ocid={`quiz.item.${idx + 1}`}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-sm">
                      {quiz.title}
                    </h3>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge variant="secondary" className="text-xs">
                        {quiz.className}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {quiz.questions.length} question
                        {quiz.questions.length !== 1 ? "s" : ""}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(quiz.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-3 text-xs"
                      data-ocid={`quiz.secondary_button.${idx + 1}`}
                      onClick={() => setViewQuiz(quiz)}
                    >
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-muted-foreground hover:text-destructive"
                      data-ocid={`quiz.delete_button.${idx + 1}`}
                      onClick={() => handleDelete(quiz.id)}
                    >
                      <Trash2 size={14} />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* View Dialog */}
      <Dialog open={!!viewQuiz} onOpenChange={(o) => !o && setViewQuiz(null)}>
        <DialogContent className="max-w-lg mx-auto max-h-[80vh] overflow-y-auto">
          {viewQuiz && (
            <>
              <DialogHeader>
                <DialogTitle>{viewQuiz.title}</DialogTitle>
              </DialogHeader>
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="secondary">{viewQuiz.className}</Badge>
                <span className="text-xs text-muted-foreground">
                  {viewQuiz.questions.length} question
                  {viewQuiz.questions.length !== 1 ? "s" : ""}
                </span>
              </div>
              <div className="space-y-5">
                {viewQuiz.questions.map((q, qi) => (
                  <div key={q._key ?? qi} className="space-y-2">
                    <p className="text-sm font-semibold text-foreground">
                      {qi + 1}. {q.text}
                    </p>
                    <div className="space-y-1.5 pl-3">
                      {q.options.map((opt, oi) => (
                        <div
                          key={OPTION_LABELS[oi]}
                          className={`text-sm px-3 py-1.5 rounded-lg flex items-center gap-2 ${
                            oi === q.correctIndex
                              ? "bg-green-100 text-green-800 font-semibold dark:bg-green-900/30 dark:text-green-300"
                              : "text-muted-foreground"
                          }`}
                        >
                          <span className="text-xs font-bold w-4">
                            {OPTION_LABELS[oi]}.
                          </span>
                          {opt}
                          {oi === q.correctIndex && (
                            <span className="ml-auto text-xs">✓ Correct</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
