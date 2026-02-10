<script lang="ts">
	import { HelpCircle, Download, ArrowLeft } from 'lucide-svelte';
</script>

<svelte:head>
	<title>CSV Import Format | Favored Prompts</title>
</svelte:head>

<div class="container">
	<header>
		<a href="/" class="back-link">
			<ArrowLeft size={16} />
			<span>Back to Library</span>
		</a>
		<h1>
            <HelpCircle size={32} class="title-icon" />
            CSV Import Format
        </h1>
		<p>Learn how to format your CSV files for bulk importing prompts into your personal library.</p>
	</header>

	<main class="card">
		<section>
			<h2>Supported CSV Structure</h2>
			<p>The first row of your CSV must contain headers. They are case-insensitive and can be in any order.</p>
			
			<div class="table-container">
				<table>
					<thead>
						<tr>
							<th>Header</th>
							<th>Description</th>
							<th>Example</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<td><code>title</code></td>
							<td>The title of your prompt.</td>
							<td>"Code Reviewer"</td>
						</tr>
						<tr>
							<td><code>text</code></td>
							<td><strong>Required.</strong> The actual prompt content.</td>
							<td>"Analyze this code..."</td>
						</tr>
						<tr>
							<td><code>category</code></td>
							<td>Main category for organization.</td>
							<td>"Development"</td>
						</tr>
						<tr>
							<td><code>tags</code></td>
							<td>Semicolon-separated tags.</td>
							<td>"code;review;js"</td>
						</tr>
						<tr>
							<td><code>collections</code></td>
							<td>Semicolon-separated group names.</td>
							<td>"Work;Urgent"</td>
						</tr>
					</tbody>
				</table>
			</div>
		</section>

		<section>
			<h2>Example File</h2>
			<div class="sample-box">
				<pre><code>title,text,category,tags,collections
"My Prompt","The prompts text here","General","tag1;tag2","Work;Research"</code></pre>
				<a href="/sample_prompts.csv" download class="download-btn">
					<Download size={18} />
					<span>Download Sample CSV</span>
				</a>
			</div>
		</section>

		<section class="tips">
			<h2>Pro Tips</h2>
			<ul>
				<li><strong>Collections</strong>: If a collection name doesn't exist, it will be automatically created.</li>
				<li><strong>Quotes</strong>: For prompts with multi-line text or internal commas, wrap the fields in double quotes (<code>"</code>).</li>
				<li><strong>Delimiters</strong>: Use a comma (<code>,</code>) for columns and a semicolon (<code>;</code>) for lists within columns.</li>
			</ul>
		</section>
	</main>
</div>

<style>
	.container {
		max-width: 900px;
		margin: 0 auto;
		padding: 4rem 2rem;
	}

	header {
		margin-bottom: 3rem;
	}

    .back-link {
        display: flex;
        align-items: center;
        gap: 0.5rem;
        color: var(--text-secondary);
        text-decoration: none;
        font-size: 0.875rem;
        margin-bottom: 1.5rem;
        transition: color 0.2s;
    }

    .back-link:hover {
        color: var(--primary-color);
    }

	h1 {
		font-size: 2.5rem;
		margin-bottom: 0.75rem;
		color: var(--text-primary);
        display: flex;
        align-items: center;
        gap: 1rem;
	}

    .title-icon {
        color: var(--primary-color);
    }

	header p {
		font-size: 1.125rem;
		color: var(--text-secondary);
	}

	.card {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 1.5rem;
		padding: 3rem;
	}

	section {
		margin-bottom: 3rem;
	}

	h2 {
		font-size: 1.5rem;
		margin-bottom: 1.25rem;
		color: var(--text-primary);
	}

	p {
		color: var(--text-secondary);
		line-height: 1.6;
		margin-bottom: 1.5rem;
	}

	.table-container {
		overflow-x: auto;
		background: var(--bg-primary);
		border-radius: 1rem;
		border: 1px solid var(--border-color);
	}

	table {
		width: 100%;
		border-collapse: collapse;
		text-align: left;
	}

	th, td {
		padding: 1rem 1.5rem;
		border-bottom: 1px solid var(--border-color);
	}

	th {
		background: var(--bg-tertiary);
		font-size: 0.75rem;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: var(--text-muted);
	}

	code {
		background: var(--bg-tertiary);
		padding: 0.2rem 0.4rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.9em;
	}

	.sample-box {
		background: var(--bg-primary);
		padding: 1.5rem;
		border-radius: 1rem;
		border: 1px solid var(--border-color);
	}

	pre {
		margin-top: 0;
		overflow-x: auto;
		padding-bottom: 1rem;
	}

	.download-btn {
		display: inline-flex;
		align-items: center;
		gap: 0.75rem;
		background: var(--primary-color);
		color: white;
		padding: 0.75rem 1.25rem;
		border-radius: 0.75rem;
		text-decoration: none;
		font-weight: 600;
		transition: all 0.2s;
	}

	.download-btn:hover {
		transform: translateY(-2px);
		box-shadow: 0 4px 12px rgba(var(--primary-color-rgb), 0.3);
	}

	.tips ul {
		list-style: none;
		padding: 0;
	}

	.tips li {
		padding: 0.75rem 0;
		border-bottom: 1px solid var(--border-color);
        color: var(--text-secondary);
	}
    
    .tips li:last-child {
        border-bottom: none;
    }

	.tips strong {
		color: var(--text-primary);
	}
</style>
