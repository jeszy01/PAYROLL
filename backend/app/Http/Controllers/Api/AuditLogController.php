<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AuditLog;
use Illuminate\Http\Request;

class AuditLogController extends Controller
{
    public function index(Request $request)
    {
        $request->validate([
            'module' => ['nullable', 'string', 'max:50'],
            'action' => ['nullable', 'string', 'max:50'],
            'from' => ['nullable', 'date'],
            'to' => ['nullable', 'date'],
            'search' => ['nullable', 'string', 'max:100'],
            'per_page' => ['nullable', 'integer', 'min:1', 'max:100'],
        ]);

        $q = AuditLog::query()->orderByDesc('created_at')->orderByDesc('id');

        if ($m = $request->query('module')) {
            $q->where('module', $m);
        }
        if ($a = $request->query('action')) {
            $q->where('action', $a);
        }
        if ($from = $request->query('from')) {
            $q->where('created_at', '>=', $from.' 00:00:00');
        }
        if ($to = $request->query('to')) {
            $q->where('created_at', '<=', $to.' 23:59:59');
        }
        if ($s = trim((string) $request->query('search', ''))) {
            $like = '%'.mb_strtolower($s).'%';
            $q->where(function ($w) use ($like) {
                $w->whereRaw('LOWER(user_name) LIKE ?', [$like])
                  ->orWhereRaw('LOWER(description) LIKE ?', [$like]);
            });
        }

        $page = $q->paginate((int) $request->query('per_page', 25));

        return response()->json([
            'data' => $page->getCollection()->map(fn (AuditLog $l) => [
                'id' => $l->id,
                'userName' => $l->user_name,
                'userRole' => $l->user_role,
                'action' => $l->action,
                'module' => $l->module,
                'description' => $l->description,
                'ipAddress' => $l->ip_address,
                'createdAt' => $l->created_at?->toIso8601String(),
            ])->values(),
            'meta' => [
                'page' => $page->currentPage(),
                'lastPage' => $page->lastPage(),
                'total' => $page->total(),
            ],
        ]);
    }
}